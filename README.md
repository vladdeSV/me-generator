**Note**: This generator is in alpha state, so any changes to the algorithm may occur until v1 is released. Specific seed will most likely not work reliably until then.

Syntax for defining rules are still work in progress. Any changes may appear at any time.

# me-generator
Generate an image with random pieces of clothing / cosmetics.

<table>
  <tr>
    <td>
      <a href="https://generator.vladde.me/?seed=tacos"><img src="https://generator.vladde.me/?seed=tacos"></a>
      <div align="center"><sub>seed: tacos</sub></div>
    </td>
    <td>
      <a href="https://generator.vladde.me/?seed=salsa"><img src="https://generator.vladde.me/?seed=salsa"></a>
      <div align="center"><sub>seed: salsa</sub></div>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://generator.vladde.me/?seed=guppy"><img src="https://generator.vladde.me/?seed=guppy"></a>
      <div align="center"><sub>seed: guppy</sub></div>
    </td>
    <td>
      <a href="https://generator.vladde.me/?seed=hello"><img src="https://generator.vladde.me/?seed=hello"></a>
      <div align="center"><sub>seed: hello</sub></div>
    </td>
  </tr>
</table>
<div align="center">
  <sub>

Examples generated using [this rulebook](https://github.com/vladdeSV/me-generator-images/blob/main/rulebook.json) from [vladdeSV/me-generator-images](https://github.com/vladdeSV/me-generator-images).

  </sub>
</div>

## Project
The projects consists of multiple parts:
- *SVG combiner*, combines multiple `.svg` files into one
- *Generator*, rulebook for how image should be combined (generating by seed)

## Features

<table width="100%">
    <tbody>
        <tr>
            <td align="center">
                <img width="100" height="100" src="./resource/example/red.svg" alt="">
                <img width="100" height="100" src="./resource/example/green.svg" alt="">
                <img width="100" height="100" src="./resource/example/yellow.svg" alt="">
                <br>
                <img width="100" height="100" src="./resource/example/magenta.svg" alt="">
                <img width="100" height="100" src="./resource/example/cyan.svg" alt="">
            </td>
          <td><i>combines into</i></td>
            <td align="center">
                <img src="./resource/example/combined.svg?test=1" alt="">
            </td>
        </tr>
    </tbody>
</table>

## Hack
Please keep in mind; in essence, this is a glorified SVG-combiner. An image is generated from a rulebook. This rulebook specifies the images which will be used, and all rules when generating the image.

I highly recommend looking at the [example rulebook](https://github.com/vladdeSV/me-generator-images/blob/9984c360b9590fecf7120bb100297d3b573190fc/rulebook.json), or [start a discussion](https://github.com/vladdeSV/me-generator/discussions).

## Roadmap
Nothing is set in stone.
- [ ] Custom rules
   - [x] Custom part weight
   - [x] Part disallows some other part
   - [ ] Part require some other part
   - [x] Multi-layered parts, sandwich parts between *groups* of SVG
 - [ ] Target groups of parts

## Why
Have you heard of [*The Binding of Isaac*](https://store.steampowered.com/app/250900/The_Binding_of_Isaac_Rebirth/)?

## License
MIT © [Vladimirs Nordholm](https://github.com/vladdeSV)
