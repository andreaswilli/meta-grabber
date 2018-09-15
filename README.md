# meta-grabber

📺 A tool to grab meta data for tv shows and rename files on your hard disk.

## Download

`Meta Grabber` is available for macOS, Windows and Linux.
The latest release can be downloaded [here](https://github.com/andreaswilli/meta-grabber/releases/latest).

## Demo
Rename your files in seconds! 🚀

![meta-grabber-demo](https://user-images.githubusercontent.com/17298270/45350375-ed4fbf00-b5b3-11e8-8cc2-a59e157a7205.gif)

## Instructions
Rename your files with these steps:

1. **Search for your TV show.**  
   Just begin typing the name of the show, the autocomplete will suggest results from the `themoviedb.org` API.

1. **Choose all the files you want to rename.**  
   The files can also be located in different directories.

1. **Select seasons/episodes of the TV show.**  
   You have to select, which seasons or episodes of the show you are looking for. You can toggle listed seasons/episodes by clicking them.

1. **(optional) Select your output directory.**  
   You can move your files to a different directory as well. If you leave this empty, all the files will remain, where they are and just change its name.

1. **Click on rename.**  
   Now click the `rename` button and you're done. 🎉

## Settings

### File name template
With this setting you can define the template, used to rename your files. You can set it to anything you want, however invalid characters such as `?` will be ignored.

Also you can use the placeholders listed below, to dynamically insert meta data into the name. In fact, you have to use at least `{season_no}` and `{episode_no}` to make sure, every file name is unique.

Placeholder | Example value | Description
--- | --- | ---
`{season_no}` | `05` | The number of the season.
`{episode_no}` | `16` | The number of the episode.
`{episode_name}` | `Felina` | The name of the episode.
`{show_name}` | `Breaking Bad` | The name of the tv show.
`{year}` | `2008` | The year in which the tv show was first aired.

## Dev stuff
Run it locally by running
```
yarn dev
```

## WIP
TODO:
* [settings page] naming template
* [settings page] default output directory
* Animate all the things
  * Messages
* Add Icons
* a11y
* i18n
* Add ability to open whole folders

Known issues:
* none (for now) 🎉
