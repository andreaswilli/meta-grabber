export function migrateFileNameTemplate(defaultOutputDir, template) {
  let newDirParts = []
  let newTemplateParts = []
  let didPlaceholderOccur = false

  if (!defaultOutputDir) return [defaultOutputDir, template]

  for (const part of defaultOutputDir.split(/[\\/]/)) {
    if (part.includes('{show_name}')) {
      didPlaceholderOccur = true
    }

    if (didPlaceholderOccur) {
      newTemplateParts.push(part)
    } else {
      newDirParts.push(part)
    }
  }

  newTemplateParts.push(template)
  return [newDirParts.join('/') + '/', newTemplateParts.join('/')]
}
