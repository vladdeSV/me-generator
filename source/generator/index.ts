import { Part } from '../svg-combiner'

type ItemPartMap = {
  [name: string]: Part
}

const map: ItemPartMap = {
  body: {
    file: './body.svg',
    x: 10,
    y: 5,
  },
  touke: {
    file: './touke.svg',
    x: 618,
    y: 3,
  },
  brownCap: {
    file: './north cap.svg',
    x: 592,
    y: 3,
  },
}
