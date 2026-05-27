import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceFile = path.join(rootDir, "data/source/C证复训题库解析.xlsx");
const outputFile = path.join(rootDir, "src/data/questions.ts");
const reportFile = path.join(rootDir, "data/question-bank-report.json");

const headerMap = {
  id: "序号",
  type: "类型",
  stem: "题         目",
  answer: "答案",
};

const typeMap = {
  单选题: "single",
  多选题: "multiple",
  判断题: "judge",
};

const optionLabels = ["A", "B", "C", "D", "E"];

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAnswer(rawValue, rowId, issues) {
  const rawAnswer = normalizeText(rawValue).toUpperCase();

  if (rowId === 438 && rawAnswer === "ABC]") {
    issues.push({
      id: rowId,
      level: "warning",
      field: "答案",
      raw: rawAnswer,
      normalized: "ABC",
      message: "按用户确认，第 438 题答案由 ABC] 修正为 ABC；未修改源 Excel。",
    });
    return "ABC";
  }

  return rawAnswer;
}

function parseOptions(row) {
  return optionLabels
    .map((label, index) => ({
      label,
      text: normalizeText(row[`选项${index + 1}`]),
    }))
    .filter((option) => option.text.length > 0);
}

function toAnswerList(type, normalizedAnswer, options, rowId, issues) {
  if (type === "judge") {
    if (normalizedAnswer === "正确" || normalizedAnswer === "错误") {
      return [normalizedAnswer];
    }

    issues.push({
      id: rowId,
      level: "error",
      field: "答案",
      raw: normalizedAnswer,
      message: "判断题答案必须为 正确 或 错误。",
    });
    return [];
  }

  const allowed = new Set(options.map((option) => option.label));
  const answerList = [...new Set(normalizedAnswer.split(""))].filter(Boolean);
  const invalid = answerList.filter((label) => !allowed.has(label));

  if (invalid.length > 0 || answerList.length === 0) {
    issues.push({
      id: rowId,
      level: "error",
      field: "答案",
      raw: normalizedAnswer,
      message: `答案必须是 ${[...allowed].join("")} 内的英文选项组合。`,
    });
  }

  return answerList;
}

function validateQuestion(question, issues) {
  if (!question.stem) {
    issues.push({
      id: question.id,
      level: "error",
      field: "题目",
      message: "题干为空。",
    });
  }

  const expectedOptions =
    question.type === "single" ? 4 : question.type === "multiple" ? 5 : 2;

  if (question.options.length !== expectedOptions) {
    issues.push({
      id: question.id,
      level: "error",
      field: "选项",
      message: `${question.typeLabel} 应有 ${expectedOptions} 个选项，实际为 ${question.options.length} 个。`,
    });
  }

  if (question.type === "single" && question.answer.length !== 1) {
    issues.push({
      id: question.id,
      level: "error",
      field: "答案",
      message: "单选题必须只有一个答案。",
    });
  }

  if (question.type === "multiple" && question.answer.length < 2) {
    issues.push({
      id: question.id,
      level: "warning",
      field: "答案",
      message: "多选题通常应至少有两个答案。",
    });
  }
}

async function main() {
  const workbook = XLSX.readFile(sourceFile);
  const sheet = workbook.Sheets["总题目"];

  if (!sheet) {
    throw new Error("未找到工作表：总题目");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const issues = [];
  const seenIds = new Set();
  const questions = rows.map((row, index) => {
    const id = Number(row[headerMap.id]);
    const typeLabel = normalizeText(row[headerMap.type]);
    const type = typeMap[typeLabel];
    const options = parseOptions(row);
    const normalizedAnswer = normalizeAnswer(row[headerMap.answer], id, issues);
    const answer = toAnswerList(type, normalizedAnswer, options, id, issues);

    if (!Number.isFinite(id)) {
      issues.push({
        id: `row-${index + 2}`,
        level: "error",
        field: "序号",
        message: "序号不是有效数字。",
      });
    } else if (seenIds.has(id)) {
      issues.push({
        id,
        level: "error",
        field: "序号",
        message: "序号重复。",
      });
    }
    seenIds.add(id);

    if (!type) {
      issues.push({
        id,
        level: "error",
        field: "类型",
        raw: typeLabel,
        message: "题型必须为 单选题、多选题 或 判断题。",
      });
    }

    const question = {
      id,
      type,
      typeLabel,
      stem: normalizeText(row[headerMap.stem]),
      options,
      answer,
      answerText: answer.join("、"),
      rawAnswer: normalizeText(row[headerMap.answer]),
    };

    validateQuestion(question, issues);
    return question;
  });

  const stats = questions.reduce(
    (acc, question) => {
      acc.total += 1;
      acc.byType[question.typeLabel] = (acc.byType[question.typeLabel] ?? 0) + 1;
      return acc;
    },
    { total: 0, byType: {} },
  );

  const report = {
    source: path.relative(rootDir, sourceFile),
    sheet: "总题目",
    generatedAt: new Date().toISOString(),
    stats,
    issueCount: issues.length,
    issues,
  };

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(
    outputFile,
    `import type { Question } from "@/types/quiz";\n\nexport const questions: Question[] = ${JSON.stringify(
      questions,
      null,
      2,
    )};\n\nexport default questions;\n`,
  );
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);

  const errorCount = issues.filter((issue) => issue.level === "error").length;
  console.log(
    JSON.stringify(
      {
        generated: path.relative(rootDir, outputFile),
        report: path.relative(rootDir, reportFile),
        stats,
        issueCount: issues.length,
        errorCount,
      },
      null,
      2,
    ),
  );

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
