#!/usr/bin/env bun
import ts from "typescript";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const supportedSource = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const normalize = (path) => path.split(sep).join("/");
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const functionKinds = new Set([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.SetAccessor,
]);
const decisionKinds = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CatchClause,
  ts.SyntaxKind.ConditionalExpression,
  ts.SyntaxKind.CaseClause,
]);
const logicalKinds = new Set([
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionQuestionToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
]);

export function crapScore(complexity, coverage) {
  if (!Number.isInteger(complexity) || complexity < 1)
    throw new Error("Complexity must be a positive integer");
  if (!Number.isFinite(coverage) || coverage < 0 || coverage > 1)
    throw new Error("Coverage must be a fraction between 0 and 1");
  return complexity ** 2 * (1 - coverage) ** 3 + complexity;
}

function executableFunction(node) {
  return Boolean(node.body) && functionKinds.has(node.kind);
}

function complexityOf(fn) {
  let complexity = 1;
  function visit(node) {
    if (executableFunction(node)) return;
    if (decisionKinds.has(node.kind)) complexity++;
    if (
      ts.isBinaryExpression(node) &&
      logicalKinds.has(node.operatorToken.kind)
    )
      complexity++;
    if (node.questionDotToken) complexity++;
    ts.forEachChild(node, visit);
  }
  for (const parameter of fn.parameters) {
    if (parameter.initializer) {
      complexity++;
      visit(parameter.initializer);
    }
  }
  visit(fn.body);
  return complexity;
}

function functionName(source, node, position) {
  const named = node.name?.getText(source);
  if (named) return named;
  if (
    ts.isVariableDeclaration(node.parent) ||
    ts.isPropertyAssignment(node.parent)
  )
    return node.parent.name.getText(source);
  if (ts.isConstructorDeclaration(node)) return "constructor";
  return `anonymous@${position.line + 1}:${position.character + 1}`;
}

function describeFunction(source, node) {
  const start = node.getStart(source);
  const bodyStart = node.body.getStart(source);
  const end = node.end;
  const position = source.getLineAndCharacterOfPosition(start);
  return {
    name: functionName(source, node, position),
    start,
    bodyStart,
    end,
    executionRanges: [
      { start: bodyStart, end },
      ...node.parameters
        .filter((parameter) => parameter.initializer)
        .map((parameter) => ({
          start: parameter.getStart(source),
          end: parameter.end,
        })),
    ],
    line: position.line + 1,
    column: position.character + 1,
    endLine: source.getLineAndCharacterOfPosition(end).line + 1,
    complexity: complexityOf(node),
    empty: ts.isBlock(node.body) && node.body.statements.length === 0,
  };
}

export function analyzeSource(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  if (source.parseDiagnostics.length)
    throw new Error(
      `Invalid source ${path}: ${ts.flattenDiagnosticMessageText(source.parseDiagnostics[0].messageText, " ")}`,
    );
  const functions = [];
  function visit(node) {
    if (executableFunction(node))
      functions.push(describeFunction(source, node));
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { source, functions };
}

function validCoordinate(value, minimum) {
  return Number.isInteger(value) && value >= minimum;
}

function validatePosition(position, label, allowLineEnd) {
  if (!isObject(position))
    throw new Error(`Invalid coverage location: ${label}`);
  if (!validCoordinate(position.line, 1))
    throw new Error(`Invalid coverage location: ${label}`);
  if (allowLineEnd && position.column === null) return;
  if (!validCoordinate(position.column, 0))
    throw new Error(`Invalid coverage location: ${label}`);
}

function offset(source, position, label, allowLineEnd = false) {
  validatePosition(position, label, allowLineEnd);
  const starts = source.getLineStarts();
  if (position.line > starts.length)
    throw new Error(`Coverage location outside source: ${label}`);
  const start = starts[position.line - 1];
  const end = starts[position.line] ?? source.text.length;
  const lineEnd = source.text.slice(start, end).replace(/[\r\n]+$/, "").length;
  if (allowLineEnd && position.column === null) return start + lineEnd;
  if (position.column > lineEnd)
    throw new Error(`Coverage column outside source: ${label}`);
  return start + position.column;
}

function range(source, location, label) {
  if (!isObject(location)) throw new Error(`Missing coverage range: ${label}`);
  const start = offset(source, location.start, label);
  const end = offset(source, location.end, label, true);
  if (end < start) throw new Error(`Reversed coverage range: ${label}`);
  return { start, end };
}

function validateCounters(record, mapping, counts, label) {
  for (const key of Object.keys(record[mapping])) {
    if (!Number.isFinite(record[counts][key]) || record[counts][key] < 0)
      throw new Error(`Invalid/missing ${counts} counter ${key} in ${label}`);
  }
  if (Object.keys(record[counts]).some((key) => !(key in record[mapping])))
    throw new Error(`Unmapped ${counts} counter in ${label}`);
}

function validateRecord(record, label) {
  if (!isObject(record))
    throw new Error(`Invalid Istanbul coverage record: ${label}`);
  for (const key of ["statementMap", "s", "fnMap", "f"]) {
    if (!isObject(record[key]))
      throw new Error(
        `Expected Istanbul ${key} in ${label}; coverage-summary.json is not supported`,
      );
  }
  validateCounters(record, "statementMap", "s", label);
  validateCounters(record, "fnMap", "f", label);
}

function ownsFunction(fn, location, mapped) {
  if (location.start < fn.start || location.start >= fn.end) return false;
  return mapped.loc.end.column === null
    ? mapped.loc.end.line === fn.endLine
    : location.end <= fn.end;
}

function matchFunctions(source, functions, record) {
  const matches = new Map(functions.map((fn) => [fn, []]));
  for (const [key, mapped] of Object.entries(record.fnMap)) {
    const location = range(
      source,
      mapped.loc,
      `${source.fileName}:function ${key}`,
    );
    const owner = functions.find((fn) => ownsFunction(fn, location, mapped));
    if (!owner)
      throw new Error(
        `Coverage function does not match source: ${source.fileName}:function ${key}; regenerate source-mapped coverage`,
      );
    matches.get(owner).push(key);
  }
  return matches;
}

function assignLines(source, functions, record) {
  const lines = new Map(functions.map((fn) => [fn, new Map()]));
  for (const [key, mapped] of Object.entries(record.statementMap)) {
    const location = range(
      source,
      mapped,
      `${source.fileName}:statement ${key}`,
    );
    const owner = functions.find((fn) =>
      fn.executionRanges.some(
        (range) => location.start >= range.start && location.start < range.end,
      ),
    );
    if (owner) {
      const ownLines = lines.get(owner);
      ownLines.set(
        mapped.start.line,
        Math.max(ownLines.get(mapped.start.line) ?? 0, record.s[key]),
      );
    }
  }
  return lines;
}

function coverageError(fn, keys, lines, record) {
  if (keys.length !== 1)
    return keys.length
      ? "Ambiguous function coverage"
      : "Missing function coverage";
  if (lines.size) return undefined;
  if (fn.empty) {
    lines.set(fn.line, record.f[keys[0]]);
    return undefined;
  }
  return "Missing executable statement coverage";
}

function measuredFunction(fn, keys, lines, record) {
  const error = coverageError(fn, keys, lines, record);
  const totalLines = lines.size;
  const coveredLines = [...lines.values()].filter((hits) => hits > 0).length;
  const coverage = error ? null : coveredLines / totalLines;
  return {
    ...fn,
    totalLines,
    coveredLines,
    coverage,
    score: error ? null : crapScore(fn.complexity, coverage),
    ...(error ? { error } : {}),
  };
}

export function measureFunctions(analysis, record) {
  const { source, functions } = analysis;
  if (!record)
    return functions.map((fn) => ({
      ...fn,
      coverage: null,
      score: null,
      totalLines: 0,
      coveredLines: 0,
      error: "Missing source coverage",
    }));
  validateRecord(record, source.fileName);
  const shortestFirst = [...functions].sort(
    (a, b) => a.end - a.start - (b.end - b.start),
  );
  const matches = matchFunctions(source, shortestFirst, record);
  const lines = assignLines(source, shortestFirst, record);
  return functions.map((fn) =>
    measuredFunction(fn, matches.get(fn), lines.get(fn), record),
  );
}

function globFiles(root, patterns) {
  if (typeof Bun === "undefined") throw new Error("revyo-crap requires Bun");
  const paths = new Set();
  for (const pattern of patterns) {
    for (const path of new Bun.Glob(pattern).scanSync({
      cwd: root,
      onlyFiles: true,
      followSymlinks: false,
    })) {
      if (!/(^|\/)(node_modules|\.git)(\/|$)/.test(normalize(path)))
        paths.add(normalize(path));
    }
  }
  return [...paths].sort();
}

function validRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !isAbsolute(value) &&
    !value.split(/[\\/]/).includes("..")
  );
}

function validateKnownKeys(config) {
  const allowed = new Set([
    "include",
    "exclude",
    "coverage",
    "maxScore",
    "output",
  ]);
  for (const key of Object.keys(config)) {
    if (!allowed.has(key)) throw new Error(`Unknown CRAP config key: ${key}`);
  }
}

function validateGlobs(config, key) {
  const values = config[key] ?? (key === "exclude" ? [] : undefined);
  const message = `${key} must contain ${key === "exclude" ? "valid" : "one or more"} relative globs within the project`;
  if (!Array.isArray(values)) throw new Error(message);
  if (key !== "exclude" && !values.length) throw new Error(message);
  if (values.some((value) => !validRelativePath(value)))
    throw new Error(message);
}

function validateMaximum(maxScore) {
  if (!Number.isFinite(maxScore) || maxScore < 1 || maxScore > 8)
    throw new Error(
      "maxScore must be a finite number from 1 through 8 (Revyo maximum)",
    );
}

function validateConfig(config) {
  if (!isObject(config)) throw new Error("CRAP config must be an object");
  validateKnownKeys(config);
  for (const key of ["include", "coverage", "exclude"])
    validateGlobs(config, key);
  const maxScore = config.maxScore ?? 8;
  validateMaximum(maxScore);
  const output = config.output ?? "reports/crap.json";
  if (!validRelativePath(output) || !output.endsWith(".json"))
    throw new Error("output must be a relative .json path within the project");
  return { ...config, exclude: config.exclude ?? [], maxScore, output };
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value))
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function readCoverageReport(root, path) {
  const report = JSON.parse(readFileSync(resolve(root, path), "utf8"));
  if (!isObject(report) || !Object.keys(report).length)
    throw new Error(`Empty/invalid coverage report: ${path}`);
  return report;
}

function coverageFile(root, key, record, path) {
  const sourcePath = record.path ?? key;
  if (typeof sourcePath !== "string" || !sourcePath)
    throw new Error(`Invalid source path in ${path}`);
  const file = normalize(relative(root, resolve(root, sourcePath)));
  if (file.startsWith("../") || isAbsolute(file))
    throw new Error(
      `Coverage path outside project: ${sourcePath}; regenerate coverage in the current checkout`,
    );
  return file;
}

function mergeRecord(records, file, record) {
  const existing = records.get(file);
  if (!existing) {
    records.set(file, structuredClone(record));
    return;
  }
  if (
    canonical(existing.statementMap) !== canonical(record.statementMap) ||
    canonical(existing.fnMap) !== canonical(record.fnMap)
  )
    throw new Error(
      `Incompatible coverage maps for ${file}; regenerate reports with the same source/provider`,
    );
  for (const counter of ["s", "f"]) {
    for (const id of Object.keys(record[counter]))
      existing[counter][id] += record[counter][id];
  }
}

function loadCoverage(root, reports) {
  const records = new Map();
  for (const path of reports) {
    for (const [key, record] of Object.entries(
      readCoverageReport(root, path),
    )) {
      validateRecord(record, `${path}:${key}`);
      mergeRecord(records, coverageFile(root, key, record, path), record);
    }
  }
  return records;
}

function sourceFiles(root, config) {
  const excluded = config.exclude.map((pattern) => new Bun.Glob(pattern));
  const sources = globFiles(root, config.include).filter(
    (path) =>
      supportedSource.test(path) && !excluded.some((glob) => glob.match(path)),
  );
  if (!sources.length)
    throw new Error("No source files matched the CRAP configuration");
  return sources;
}

function scoreSource(root, path, record, maxScore) {
  const analysis = analyzeSource(
    path,
    readFileSync(resolve(root, path), "utf8"),
  );
  return measureFunctions(analysis, record).map((measured) => {
    const { start, bodyStart, end, executionRanges, empty, ...metrics } =
      measured;
    return {
      file: path,
      ...metrics,
      passed: !metrics.error && metrics.score <= maxScore,
    };
  });
}

function compareFunctions(a, b) {
  return (
    (b.score ?? Infinity) - (a.score ?? Infinity) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column
  );
}

export function createReport(root, inputConfig) {
  root = resolve(root);
  const config = validateConfig(inputConfig);
  const sources = sourceFiles(root, config);
  const reports = globFiles(root, config.coverage);
  if (!reports.length)
    throw new Error(
      "No coverage reports found; run fresh test coverage before revyo-crap",
    );
  const records = loadCoverage(root, reports);
  const functions = sources.flatMap((path) =>
    scoreSource(root, path, records.get(path), config.maxScore),
  );
  if (!functions.length)
    throw new Error(
      "No executable JS/TS functions matched; configure a native gate for native-only source",
    );
  functions.sort(compareFunctions);
  const failing = functions.filter((fn) => !fn.passed);
  return {
    formatVersion: 1,
    metric: "CRAP = CC^2 * (1 - executableLineCoverage)^3 + CC",
    maxScore: config.maxScore,
    sourceFiles: sources.length,
    coverageReports: reports,
    passed: failing.length === 0,
    summary: {
      functions: functions.length,
      failing: failing.length,
      maxScore: Math.max(...functions.map((fn) => fn.score ?? 0)),
    },
    functions,
  };
}

function failureMessage(fn, maxScore) {
  const detail =
    fn.error ??
    `CRAP ${fn.score.toFixed(2)} > ${maxScore} (CC ${fn.complexity}, coverage ${(fn.coverage * 100).toFixed(1)}%)`;
  return `${fn.file}:${fn.line}:${fn.column} ${fn.name}: ${detail}`;
}

export function runGate(configPath) {
  const path = resolve(configPath);
  const root = dirname(path);
  const config = validateConfig(JSON.parse(readFileSync(path, "utf8")));
  const report = createReport(root, config);
  const output = resolve(root, config.output);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
  for (const fn of report.functions
    .filter((entry) => !entry.passed)
    .slice(0, 20))
    console.error(failureMessage(fn, config.maxScore));
  console.log(
    `CRAP: ${report.summary.functions} functions, ${report.summary.failing} failures. Report: ${normalize(relative(process.cwd(), output))}`,
  );
  return report.passed ? 0 : 1;
}

function argumentValue(args, key) {
  if (!args.length || args[0].startsWith("--"))
    throw new Error(`Invalid argument: ${key}`);
  return args.shift();
}

function gateConfigPath(args) {
  let cwd = process.cwd();
  let configPath = "crap.config.json";
  while (args.length) {
    const key = args.shift();
    if (key === "--cwd") cwd = resolve(argumentValue(args, key));
    else if (key === "--config") configPath = argumentValue(args, key);
    else throw new Error(`Invalid argument: ${key}`);
  }
  return resolve(cwd, configPath);
}

export function crapMain(args = process.argv.slice(2)) {
  try {
    if (args.includes("--help") || args.includes("-h")) {
      console.log(
        "Usage: revyo-crap [--config PATH] [--cwd PATH]\nRun fresh coverage first. Defaults to crap.config.json; paths inside it are relative to its directory. Revyo maximum score: 8.",
      );
      return 0;
    }
    return runGate(gateConfigPath([...args]));
  } catch (error) {
    console.error(`revyo-crap: ${error.message}`);
    return 2;
  }
}

if (import.meta.main) process.exitCode = crapMain();
