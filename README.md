# meta-grabber

A tool to grab meta data for tv shows and rename files on your hard disk.

## Download

`Meta Grabber` is available for macOS, Windows and Linux.
The latest release can be downloaded [here](https://github.com/andreaswilli/meta-grabber/releases/latest).

## Example

#### Before
```
atax-westworld.s02e01.1080p.mkv
atax-westworld.s02e02-1080p.mkv
atax-westworld.s02e03-1080p.mkv
atax-westworld.s02e04-1080p.mkv
atax-westworld.s02e05-1080p.mkv
atax-westworld.s02e06-1080p.mkv
atax-westworld.s02e07-1080p.mkv
atax-westworld.s02e08-1080p.mkv
atax-westworld.s02e09-1080p.mkv
atax-westworld.s02e10-1080p.mkv
```
#### After
```
S02 E01 - Zeit der Vergeltung.mkv
S02 E02 - Der Weg nach Glory.mkv
S02 E03 - Das Fort der verlorenen Hoffnung.mkv
S02 E04 - Das Rätsel der Sphinx.mkv
S02 E05 - Eine neue Stimme.mkv
S02 E06 - Phasenraum.mkv
S02 E07 - Häutungen.mkv
S02 E08 - Die Lebenden und die Verdammten.mkv
S02 E09 - Virus.mkv
S02 E10 - Der Passagier.mkv
```

## Dev stuff
Run it locally by running
```
yarn dev
```

## WIP
TODO:
* Make buttons colourful
* Adjust UI colours
* Add Settings page (local storage)
  * language of API requests
  * naming template
  * default output directory
* Animate all the things
  * Messages
* Add Icons
* a11y
* i18n
