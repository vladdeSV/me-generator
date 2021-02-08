/*
# what do i want from the project?
generate an SVG from different parts.
*/

type Item = {
  data: string
};

type PoolItem = {
  itemId: (string | null),
  weight?: number,
};

type Options = {
  repository: { [name: string]: Item },
  schema: PoolItem[][]
};

function generate(options: Options): (Item | null)[] {
  try {
    const output: (Item | null)[] = [];

    options.schema.forEach((poolItems: PoolItem[]) => {
      const selectedPoolItem = poolItems[Math.floor(Math.random() * poolItems.length)];
      if (selectedPoolItem.itemId === null) {
        output.push(null);
        return;
      }

      const selectedItem = options.repository[selectedPoolItem.itemId];
      if (selectedItem === undefined) {
        throw new Error(`undefined part id ${selectedPoolItem.itemId}`);
      }

      output.push(selectedItem);
    });

    return output;
  } catch (e) {
    return [{ data: 'dead blue' }];
  }
}

const opts: Options = {
  repository: {
    body: { data: 'regular body' },
    hoodie: { data: 'grey hoodie' },
    blackCargoPants: { data: 'black cargo pants' },
    dualitySocks: { data: 'orange and white socks' },
    beard: { data: 'normal beard' },
    hair: { data: 'hair' },
    brownCap: { data: 'the north face cap' },
  },
  schema: [
    [{ itemId: 'body' }],
    [{ itemId: 'dualitySocks' }, { itemId: null }],
    [{ itemId: 'blackCargoPants' }],
    [{ itemId: 'hoodie' }, { itemId: null }],
    [{ itemId: 'hair' }],
    [{ itemId: 'beard' }],
    [{ itemId: 'brownCap' }, { itemId: null }],
  ],
};

for (let index = 0; index < 5; index += 1) {
  console.log(generate(opts).map((item) => (item === null ? null : item.data)));
}
