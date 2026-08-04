#!/usr/bin/env node

const command = process.argv[2] || "help";

const commands = {
    discover: "./commands/discover",
    manifest: "./commands/manifest",
    verify: "./commands/verify",
    audit: "./commands/audit",
    migrate: "./commands/migrate",
    analyze: "./commands/analyze",
    status: "./commands/status",
    validate: "./commands/validate-contract"
};

if (!commands[command]) {
    console.log(`
CGP Bootstrap CLI

Usage

node tools/bootstrap <command>

Commands

discover
manifest
verify
audit
migrate
analyze
status
validate
`);
    process.exit(0);
}

require(commands[command]);
