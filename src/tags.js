import * as Arbitrary from 'test/arbitrary'
import * as Loop from 'test/loop'

import { generateRandomString } from 'random-gen'
import * as RecordUtil from 'util/record-util'

import { List, Map, Set } from 'immutable'

const v_tag = RecordUtil.createFactory({
  name:'',
  ff_ids:Set(),
},{
  toJs: a => {
    a.ff_ids = a.ff_ids.toArray()
    return a
  },
  fromJs: a => {
    a.ff_ids = Set(a.ff_ids)
    return a
  }
})


const v_derived = RecordUtil.createFactory({
  size:0,
},{
  toJs: a => a,
  fromJs: a => a,
})




export const create = v_tag

const makeId = () => generateRandomString(40)


export const empty = Map

const insert = (id,tag,tags) => {
  const already_id = tags.reduce((acc,val,i) => {
    if (val.get('name') === tag.get('name')) {
      acc = i
    }
    return acc
  }, undefined)

  if (already_id) {
    tags = tags.update(already_id,a=>a.update('ff_ids', b=>b.concat(tag.get('ff_ids'))))
  } else {
    tags = tags.set(id, tag)
  }
  return tags
}

export const push = (tag,tags) => tags.set(makeId(), tag)

const computeDerived = (ffs,tags) => {
  tags = tags.map(v_tag)

  const sortBySize = (ids) => {
    const compare = (a,b) => {
      const s_a = ffs.get(a).get('size')
      const s_b = ffs.get(b).get('size')
      if (s_a > s_b) {
        return -1
      } else if (s_a === s_b) {
        return 0
      } else {
        return 1
      }
    }
    const sizes = ids.sort(compare)
    return sizes
  }

  const filterChildren = (ids) => {
    const getAllChildren = (id) => {
      const children = ffs.get(id).get('children')
      return children.concat(children.map(getAllChildren).reduce((acc,val)=>acc.concat(val),List()))
    }

    if (ids.size <= 1) {
      return ids
    } else {
      const head_id = ids.get(0)
      const children_head_id = getAllChildren(head_id)

      const tail = ids.slice(1)
      const filtered_tail = tail.filter(a=>children_head_id.includes(a)===false)

      return List.of(head_id).concat(filterChildren(filtered_tail))
    }
  }

  const reduceToSize = (ids) => {
    return ids.reduce((acc,val)=>acc+ffs.get(val).get('size'),0)
  }

  tags = tags.map((tag) => {
    const ids = List(tag.get('ff_ids'))

    // console.log('\n\nstart')
    // let iii = ids
    // console.log(1,iii)
    // iii = sortBySize(iii)
    // console.log(2,iii)
    // iii = filterChildren(iii)
    // console.log(3,iii)
    // iii = reduceToSize(iii)
    // console.log(4,iii)
    // console.log('finish\n\n')

    tag = RecordUtil.compose(v_derived({
      size: reduceToSize(filterChildren(sortBySize(ids))),
    }), tag)

    return tag
  })

  return tags
}

export const update = (ffs,tags) => {
  tags = tags.reduce((acc,val,id)=>insert(id,val,acc),empty())
  tags = tags.filter((val)=>val.get('ff_ids').size !== 0)
  tags = computeDerived(ffs,tags)

  return tags
}



export const toSaveJs = a => {
  a = a.map(v_tag.toJs)
  a = a.toObject()

  return a
}

export const fromSaveJs = a => {
  a = Map(a)
  a = a.map(v_tag.toJs)

  return a
}