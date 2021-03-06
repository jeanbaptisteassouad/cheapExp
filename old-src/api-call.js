
import { request } from 'request'
import { getCookie } from 'cookie'

import * as Base64 from 'base64'

const shouldLog = !getCookie().impicklerick

export const logError = (stack,componentStack) => {
  if (shouldLog) {
    return request({
      method:'POST',
      url:'http://localhost:3000/none/log/browserError',
      headers:{
        'content-type': 'application/json'
      },
      body:JSON.stringify({
        stack,
        componentStack
      })
    })
  } else {
    return new Promise((resolve)=>resolve())
  }
}

export const readError = (nb) => {
  return request({
    method:'GET',
    url:'http://localhost:3000/none/log/browserError?nb='+nb,
    headers:{
      'content-type': 'application/json'
    }
  })
}


export const logNbFiles = (nb) => {
  if (shouldLog) {
    return request({
      method:'POST',
      url:'http://localhost:3000/none/log/nbFiles',
      headers:{
        'content-type': 'application/json'
      },
      body:JSON.stringify({
        nb
      })
    })
  } else {
    return new Promise((resolve)=>resolve())
  }
}

export const readNbFiles = (nb) => {
  return request({
    method:'GET',
    url:'http://localhost:3000/none/log/nbFiles?nb='+nb,
    headers:{
      'content-type': 'application/json'
    }
  })
}
















const ref = {
  token:null,
  retry:0,
  account_name:'',
  password:''
}


export const signUp = (account_name,password) => {
  return request({
    method:'POST',
    url:'http://localhost:3000/basic/account',
    headers:{
      Authorization:'Basic '+Base64.fromUtf8(account_name+':'+password)
    }
  })
  .then(() => signIn(account_name,password))
}


export const signIn = (account_name,password) => {
  ref.account_name = account_name
  ref.password = password
  return getToken()
}

const getToken = () => {
  return request({
    method:'GET',
    url:'http://localhost:3000/basic/account',
    headers:{
      Authorization:'Basic '+Base64.fromUtf8(ref.account_name+':'+ref.password)
    }
  })
  .then(res => {
    res = JSON.parse(res)
    ref.token = res.token
    ref.retry = 1
  })
}

const retry = f => {
  if (ref.retry > 0) {
    ref.retry -= 1
    return getToken().then(f)
  }
}


// SOME DUMMY TEST


const checkToken = () => {
  return request({
    method:'GET',
    url:'http://localhost:3000/bearer',
    headers:{
      Authorization:'Bearer '+ref.token
    }
  })
  .catch(() => retry(() => checkToken()))
}


const createFs = (root) => {
  return request({
    method:'POST',
    url:'http://localhost:3000/bearer/fs/'+root,
    headers:{
      Authorization:'Bearer '+ref.token
    }
  })
}


const readFs = (root) => {
  return request({
    method:'GET',
    url:'http://localhost:3000/bearer/fs/'+root,
    headers:{
      Authorization:'Bearer '+ref.token
    }
  })
}

const pushFs = (root,path) => {
  return request({
    method:'POST',
    url:'http://localhost:3000/bearer/fs/'+root+path,
    headers:{
      Authorization:'Bearer '+ref.token
    }
  })
}




const makeBigBody = (num) => {
  let arr = []
  for (let i = num - 1; i >= 0; i--) {
    arr.push(Math.floor(Math.random() * 9))
  }
  return arr.join('')
}


const sendBigFile = (body) => {
  return getToken('fufu','pass')
    .then(() => console.time('sendBigFile'))
    .then(() => request({
      method:'GET',
      url:'http://localhost:3000/bearer',
      headers:{
        Authorization:'Bearer '+ref.token
      },
      body
    }))
    .then(() => console.timeEnd('sendBigFile'))
}





const makeArr = (num) => {
  let arr = []
  for (let i = 0; i < num; i++) {
    let str = ''
    for (let j = 0; j < 1+Math.floor(Math.random() * 8); j++) {
      str += '/'+Math.floor(Math.random() * 10)
    }
    arr.push(str)
  }
  return arr
}


const paraDoAction = (arr) => {
  const roo = Math.floor(Math.random() * 2000000)
  return getToken('fufu','pass')
    .then(() => createFs(roo))
    .then(() => Promise.all(arr.map(e => pushFs(roo,e))))
    .then(() => readFs(roo))
    .then(a => console.log(a))
}


const seqDoAction = (arr) => {
  const roo = Math.floor(Math.random() * 2000000)
  let pro = getToken('fufu','pass')
    .then(() => createFs(roo))
    .then(() => console.time('seqDoAction'))
  arr.forEach(e => {
    pro = pro.then(() => pushFs(roo,e))
  })

  pro.then(() => console.timeEnd('seqDoAction'))
    .then(() => readFs(roo))
    .then(a => console.log(JSON.parse(a)))
}


const testDebugLog = () => {
  return request({
    method:'GET',
    url:'http://localhost:3000/basic/',
  })
}

// window.swag = {
//   logError,
//   readError,

//   signUp,
//   signIn,
//   getToken,
//   checkToken,
//   ref,
//   createFs,
//   readFs,
//   pushFs,
//   paraDoAction,
//   testDebugLog,
//   makeArr,
//   seqDoAction,
//   makeBigBody,
//   sendBigFile,
//   ref
// }

