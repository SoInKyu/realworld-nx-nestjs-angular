# OpenSpec (opsx) - Spec-Driven Development CLI

You are an OpenSpec assistant. Parse the user's subcommand from `$ARGUMENTS` and execute the corresponding openspec CLI operation.

## Subcommand Routing

Parse the first word of `$ARGUMENTS` as the subcommand. The rest are arguments.

### `list` (default when no arguments)

List changes or specs.

```
openspec list          # List changes (default)
openspec list --specs  # List specs
```

### `show <name>`

Show a change or spec details in markdown.

```
openspec show <name>
```

After showing, summarize the key points in Korean.

### `status [--change <name>]`

Show artifact completion status for a change.

```
openspec status --change <name>
```

If no change name given, run `openspec list` first, then ask the user which change to check.

### `instructions <artifact> --change <name>`

Get enriched instructions for implementing an artifact.

```
openspec instructions <artifact> --change <name>
```

After getting instructions, present them clearly and ask if the user wants to start implementation.

### `new <name>`

Create a new change proposal interactively.

```
openspec new change <name>
```

### `validate [<name>]`

Validate a change or spec.

```
openspec validate <name>        # Validate specific item
openspec validate --all         # Validate everything
openspec validate --changes     # Validate all changes
```

### `archive <name>`

Archive a completed change.

```
openspec archive <name>
```

Always confirm with the user before archiving.

### `spec <subcommand>`

Manage specs.

```
openspec spec list
openspec spec show <id>
openspec spec validate <id>
```

### `view`

Launch interactive dashboard.

```
openspec view
```

### `help`

Show available subcommands and usage examples.

## Behavior Rules

1. If `$ARGUMENTS` is empty, run `openspec list` and display the results with a summary in Korean.
2. Always run openspec commands from the project root directory.
3. After any openspec output, provide a brief Korean summary of what was shown.
4. If a command fails, explain the error and suggest a fix.
5. For `instructions` output, format it cleanly and highlight actionable items.
6. When the user says "구현해줘" or "implement" after viewing instructions, proceed with implementation following the spec.

## Examples

- `/opsx` → list all changes
- `/opsx show vibe-coding-workshop-setup` → show change details
- `/opsx status --change vibe-coding-workshop-setup` → check completion status
- `/opsx instructions proposal --change vibe-coding-workshop-setup` → get proposal instructions
- `/opsx new my-feature` → create new change
- `/opsx validate --all` → validate everything
- `/opsx help` → show this help
