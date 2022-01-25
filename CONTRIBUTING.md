# Contributing

## Workflow

1. Bring code changes to `develop` branch (either directly or via pull request). Never work directly on `master`!
1. A GitHub Action will be triggered by the commit. This action will build the application. If the version number in `package.json` is equal to a previous release, nothing more will happen. If you want to create a new release draft, you need to bump the version number. Then a new release draft will be created and the built executables will be attached by the GitHub Action. (On subsequent commits with the same version number the release draft will be updated with the new executables.)
1. Download the executables and make sure they work as expected.
1. Once the new executables are ready to be released, update the description of the draft if necessary (make sure to choose `develop` as target for tagging) and release it. The current commit will be tagged automatically.
1. Another GitHub Action which merges the new commits from `develop` into `master` will be triggered.

## Local development

Run it locally by following these steps:

1. Install dependencies: `npm i`
1. Start build: `npm run serve`
1. Start the electron app in a **new** terminal window: `npm run start`

Now you can make changes, save the modified files, then return to the app and reload (`ctrl+r` on Windows/Linux, `cmd+r` on macOS). Your changes should now appear in the app.
