# TrickLens Studio

https://tlstudio.nicksneed.com/

TrickLens is a web-based utility that allows you to view, customize, and export your Game Boy Camera photos from a `.sav` file.

## Features

- **Load Game Boy Camera saves:** Open and view photos directly from your `.sav` files.
- **Custom Palettes:** Apply a variety of color palettes to change the look of your photos.
- **Custom Frames:** Load `.png` files to be used as frames for your photos.
- **Export to PNG:** Save your favorite shots as high-quality PNG files.
- **View Deleted Photos:** Option to show photos that have been marked as deleted in the save file.
- **Adjustable Scaling:** View your photos at different zoom levels.
- **Montages:** Combine multiple photos into layouts or create RGB color photos from three separate exposures.

## How to Use

1.  Open the TrickLens application in your web browser.
2.  Use the "Load .sav" button to open your Game Boy Camera save file.
3.  Your photos will be displayed in a grid.
4.  Use the toolbar to change the palette, add a frame, or adjust other settings.
5.  Click on any photo to see a larger preview and use the "Export as PNG" button to save it.

### Montages and RGB

When editing a photo, you can select additional photos to create a montage.

- **Standard Montages:** Combine photos using layouts like horizontal strips, vertical strips, or quadrants.
- **RGB Composition:** Select the **rgb** option to combine three photos into a single color photo. This uses the first montage photo as the Red channel, the second as the Green channel, and the current photo as the Blue channel.

### Custom palettes and quick colors

- Custom palettes and quick colors can be loaded via an external JSON
- Open the palette menu and click Load config to load a config file

JSON format:

```
{
    "palettes" : {
        "paleteID1": {
            "name": "Palette Name 1",
            "colors": [
                { "r": 255, "g": 232, "b": 207 },
                { "r": 223, "g": 144, "b": 79 },
                { "r": 175, "g": 40, "b": 32 },
                { "r": 48, "g": 24, "b": 80 }
            ]
        },
        "paleteID2": {
            "name": "Palette Name 2",
            "colors": [
                { "r": 223, "g": 216, "b": 192 },
                { "r": 207, "g": 176, "b": 112 },
                { "r": 176, "g": 80, "b": 16 },
                { "r": 0, "g": 0, "b": 0 }
            ]
        }
    },
    "quickColors": [
        { "r": 255, "g": 0, "b": 0 },
        { "r": 255, "g": 64, "b": 239 },
        { "r": 255, "g": 248, "b": 255 },
        { "r": 0, "g": 0, "b": 0 }
    ]
}
```

## To do

- Add bulk export
- Fix effects and drawing when applying rgb
- Add hold shift while drawing
- Add color picker for palettes
- Add undo to the pixel editor
- Add stamps
- Add help docs
- Show rgb values for custom palettes
- Add option to save custom palettes
