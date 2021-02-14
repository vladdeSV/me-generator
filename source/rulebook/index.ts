import { Part } from '../svg-combiner'

/*
# what do i want from the project?
generate an SVG from different parts.
*/

type Item = {
  name: string
}

type Pool = {
  id: string
  poolItems: PoolItem[]
}

type PoolItem = {
  itemId: (string | null)
  weight?: number
}

type Options = {
  repository: { [name: string]: Item }
  schema: Pool[]
}

function generate(options: Options): Item[] {
  try {
    const output: Item[] = []

    // apply rules

    options.schema.forEach((pool: Pool) => {
      const poolItems = pool.poolItems
      const selectedPoolItem = poolItems[Math.floor(Math.random() * poolItems.length)]
      if (selectedPoolItem.itemId === null) {
        return
      }

      const selectedItem = options.repository[selectedPoolItem.itemId]
      if (selectedItem === undefined) {
        throw new Error(`undefined part id ${selectedPoolItem.itemId}`)
      }

      output.push(selectedItem)
    })

    return output
  } catch (e) {
    return [{ name: 'dead blue' }]
  }
}

const opts: Options = {
  repository: {
    // body
    body: {
      name: 'regular body',
    },
    // torso
    hoodie: {
      name: 'grey hoodie',
    },
    grayCrewneck: {
      name: 'ltt crewneck',
    },
    // legs
    blackCargoPants: {
      name: 'black cargo pants',
    },
    beigeCargoPants: {
      name: 'beige cargo pants',
    },
    swimmingPants: {
      name: 'purple to pink faded swimming pants',
    },
    // feet
    dualitySocks: {
      name: 'orange and white socks',
    },
    // head
    beard: {
      name: 'normal beard',
    },
    touke: {
      name: 'grey beanie',
    },
    brownCap: {
      name: 'the north face cap',
    },
  },
  schema: [
    {
      id: 'body',
      poolItems: [{ itemId: 'body' }],
    },
    {
      id: 'feet',
      poolItems: [{ itemId: 'dualitySocks' }, { itemId: null }],
    },
    {
      id: 'legs',
      poolItems: [{ itemId: 'blackCargoPants' }, { itemId: 'beigeCargoPants' }, { itemId: 'swimmingPants' }],
    },
    {
      id: 'torso',
      poolItems: [{ itemId: 'hoodie' }, { itemId: 'grayCrewneck' }, { itemId: null }],
    },
    {
      id: 'face',
      poolItems: [{ itemId: 'beard' }],
    },
    {
      id: 'head',
      poolItems: [{ itemId: 'brownCap' }, { itemId: 'touke' }],
    },
  ],
}

for (let index = 0; index < 5; index += 1) {
  console.log(generate(opts).map((item) => (item === null ? null : item.name)))
}
