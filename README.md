# meta-grabber

📺 A tool to grab meta data for tv shows and rename files on your hard disk.

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/Y8Y7LBIM)

## Download

`Meta Grabber` is available for macOS, Windows and Linux.
The latest release can be downloaded [here](https://github.com/andreaswilli/meta-grabber/releases/latest).

## Demo
Rename your files in seconds! 🚀

![meta-grabber](https://user-images.githubusercontent.com/17298270/47755099-5f33b300-dc9d-11e8-9560-aca6a21527a9.gif)

## Instructions
Rename your files with these steps:

1. **Search for your TV show.**  
   Just begin typing the name of the show, the autocomplete will suggest results from the `themoviedb.org` or `thetvdb.com` API, depending on which is specified in settings.

1. **Choose all the files you want to rename.**  
   The files can also be located in different directories.

1. **Select seasons/episodes of the TV show.**  
   You have to select which seasons or episodes of the show you are looking for. You can toggle listed seasons/episodes on or off by clicking them.

1. **(optional) Select your output directory.**  
   You can move your files to a different directory as well. If you leave this empty, all the files will remain where they are and just change their names.

1. **Click on rename.**  
   Now click the `rename` button and you're done. 🎉

## Settings

### Meta data language
Specifies the language of the meta data that will be grabbed. Defaults to English.

### Meta data provider
If you don't find the tv show you are looking for, you can try to switch the provider.
You have two different options:
- [TheMovieDB](https://www.themoviedb.org/)
- [TheTVDB](https://www.thetvdb.com/)

### File name template
With this setting you can define the template used to rename your files. You can set it to anything you want, however invalid characters such as `?` will be ignored.

Also you can use the placeholders listed below to dynamically insert meta data into the name. In fact, you have to use at least `{season_no}` and `{episode_no}` to make sure every file name is unique.

Placeholder | Example value | Description
--- | --- | ---
`{season_no}` | `05` | The number of the season.
`{episode_no}` | `16` | The number of the episode.
`{episode_name}` | `Felina` | The name of the episode.
`{show_name}` | `Breaking Bad` | The name of the tv show.
`{year}` | `2008` | The year in which the tv show was first aired.

### Default output directory
The output directory that will be used if you don't manually select one. Your directory name can also include `{show_name}`, which will be replaced with the name of the tv show. This is useful to automatically organise your tv shows in subfolders.

### Included file types
You can open a whole directory or even multiple at once. This option specifies which file types will be included. Defaults to `mkv,avi,mp4,mov`.

### Excluded terms
Files that contain one of the terms set here will not get included. This applies to the complete file name (including directory name). This option is mainly existing to not open sample files when importing whole directories. Defaults to `sample`.

## Local development
Run it locally by following these steps:

1. Install dependencies: `yarn` or `npm i`

1. Start build: `yarn serve` or `npm run serve`

1. Start the electron app in a **new** terminal window: `yarn dev` or `npm run dev`

Now you can make changes, save the modified files, then return to the app and reload (`ctrl+r` on Windows/Linux, `cmd+r` on macOS). Your changes should now appear in the app.
