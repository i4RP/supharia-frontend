#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

function printHelp() {
    const lines = [
        "Usage: node llm/scripts/devin-bootstrap.js [options]",
        "",
        "Options:",
        "  --with-template      Append delegation template text",
        "  --task <text>        Append task text at the end",
        "  --task-file <path>   Append task text loaded from file",
        "  --copy               Copy output to clipboard (default)",
        "  --no-copy            Do not copy to clipboard",
        "  --help               Show this help",
    ]

    process.stdout.write(`${lines.join("\n")}\n`)
}

function parseArgs(argv) {
    const options = {
        with_template: false,
        task: "",
        task_file: "",
        copy: true,
    }

    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index]

        if (arg === "--with-template") {
            options.with_template = true
            continue
        }

        if (arg === "--task") {
            const value = argv[index + 1]
            if (!value) {
                throw new Error("Missing value for --task")
            }
            options.task = value
            index++
            continue
        }

        if (arg === "--task-file") {
            const value = argv[index + 1]
            if (!value) {
                throw new Error("Missing value for --task-file")
            }
            options.task_file = value
            index++
            continue
        }

        if (arg === "--copy") {
            options.copy = true
            continue
        }

        if (arg === "--no-copy") {
            options.copy = false
            continue
        }

        if (arg === "--help") {
            printHelp()
            process.exit(0)
        }

        throw new Error(`Unknown argument: ${arg}`)
    }

    return options
}

function readFileText(file_path) {
    return fs.readFileSync(file_path, "utf8")
}

function extractFirstCodeBlock(markdown_text) {
    const matched = markdown_text.match(/```(?:text)?\n([\s\S]*?)\n```/)
    if (!matched) {
        return markdown_text.trim()
    }
    return matched[1].trim()
}

function copyToClipboard(text) {
    const commands = [
        { cmd: "pbcopy", args: [] },
        { cmd: "wl-copy", args: [] },
        { cmd: "xclip", args: ["-selection", "clipboard"] },
        { cmd: "xsel", args: ["--clipboard", "--input"] },
        { cmd: "clip", args: [] },
    ]

    for (const command of commands) {
        const result = spawnSync(command.cmd, command.args, {
            input: text,
            encoding: "utf8",
        })

        if (!result.error && result.status === 0) {
            return command.cmd
        }
    }

    return ""
}

function main() {
    const options = parseArgs(process.argv.slice(2))

    const script_dir = path.dirname(fileURLToPath(import.meta.url))
    const repo_root = path.resolve(script_dir, "..", "..")
    const bootstrap_path = path.join(
        repo_root,
        "llm",
        "docs",
        "devin-bootstrap-prompt.ja.md"
    )
    const template_path = path.join(
        repo_root,
        "llm",
        "docs",
        "devin-delegation-template.ja.md"
    )

    const bootstrap_markdown = readFileText(bootstrap_path)
    const bootstrap_prompt = extractFirstCodeBlock(bootstrap_markdown)

    const sections = [bootstrap_prompt]

    if (options.with_template) {
        const template_text = readFileText(template_path).trim()
        sections.push(["", "[Devin Delegation Template]", template_text].join("\n"))
    }

    if (options.task_file) {
        const task_path = path.resolve(process.cwd(), options.task_file)
        const task_text = readFileText(task_path).trim()
        sections.push(["", "[Task]", task_text].join("\n"))
    }

    if (options.task) {
        sections.push(["", "[Task]", options.task.trim()].join("\n"))
    }

    const output = sections.join("\n")

    if (options.copy) {
        const copied_by = copyToClipboard(output)
        if (copied_by) {
            process.stderr.write(`[devin-bootstrap] Copied to clipboard via ${copied_by}\n`)
        } else {
            process.stderr.write(
                "[devin-bootstrap] Clipboard copy failed. Install pbcopy/wl-copy/xclip/xsel or use --no-copy.\n"
            )
        }
    }

    process.stdout.write(`${output}\n`)
}

try {
    main()
} catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`[devin-bootstrap] ${message}\n`)
    process.exit(1)
}
