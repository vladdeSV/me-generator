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

## Hack
> Can I hack it?

Yes. Although this project right now generates a person with clothes, there is nothing stopping you from changing what is being generated. It is a bit bulky, but with some effort you could make your own generator.

In essence, this is a glorified SVG-combiner.

### Simple setup
See this example project: *todo*

## Roadmap
Nothing is set in stone. This is a passion project at best, and I will work on what I want when I feel like it. But in general, there are a few things I want to besides improving the codebase:
- [ ] Allow for custom generator rules in simple JSON format. I would be so cool if any generation logic was a *simple* document, making it very hackable.
   - [x] Parts generator
   - [ ] Custom rules (disallow certain combinations, etc.)
- [ ] Add more clothes.
- [ ] `//todo: add more`

## Why
Have you heard of [The Binding of Isaac](https://store.steampowered.com/app/250900/The_Binding_of_Isaac_Rebirth/)?

## License
MIT © [Vladimirs Nordholm](https://github.com/vladdeSV)
