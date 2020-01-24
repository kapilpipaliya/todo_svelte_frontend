/* Ismael Celis 2010
Simplified WebSocket events dispatcher
*/
//import IsomorphicWs from 'isomorphic-ws'
import { writable } from 'svelte/store'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
export const ws_connected = writable(false)
import * as M from "@msgpack/msgpack";

/*
usage:
for $ prefix use always check if(mounted) first.
*/
// import * as cookie from 'cookie';
//import m from "@msgpack/msgpack";
//const {encode, decode} = m;
// const data = decode(evt.data)

// same library:
//A WebSocket JavaScript library https://sarus.anephenix.com
//https://github.com/anephenix/sarus
class WsBase {
  
}
export class ServerEventsDispatcher {
  private path: string;
  private req: {}
  private res: {}
  private callbacks: {}
  private conn: WebSocket

  constructor(path, req, res) {
    this.bind = this.bind.bind(this)
    this.bind$ = this.bind$.bind(this)
    this.bind_ = this.bind_.bind(this)
    //this.bind_F = this.bind_F.bind(this)
    this.unbind = this.unbind.bind(this)
    this.unbind_ = this.unbind_.bind(this)
    this.trigger = this.trigger.bind(this)
    //this.triggerFile = this.triggerFile.bind(this)
    this.onmessage = this.onmessage.bind(this)
    this.onclose = this.onclose.bind(this)
    this.onopen = this.onopen.bind(this)
    this.onerror = this.onerror.bind(this)
    this.dispatch = this.dispatch.bind(this)
    this.batchBind = this.batchBind.bind(this)
    this.batchBind_T = this.batchBind_T.bind(this)

    this.path = path
    this.req = req
    this.res = res
    this.setupConnection()
    this.callbacks = {}
  }
  setupConnection() {
    this.conn = new WebSocket(this.path, [])
    // dispatch to the right handlers
    this.conn.onmessage = this.onmessage

    this.conn.onclose = this.onclose
    //this.conn.onopen = this.onopen;
    this.conn.addEventListener('open', this.onopen)
  }
  destroy() {
    this.conn.onmessage = undefined
    this.conn.onclose = undefined
    this.conn.removeEventListener('open', this.onopen)
    this.conn.close()
  }

  bind(event, callback, handleMultiple = 0) {
    this.callbacks[JSON.stringify(event)] =
      this.callbacks[JSON.stringify(event)] ?? []
    this.callbacks[JSON.stringify(event)].push([handleMultiple, callback]) // 0 means unsubscribe using first time
    return this
  }
  unbind_(event_names = []) {
    R.map(event => {
      this.unbind(JSON.stringify(event))
    }, event_names)
    return this
  }
  batchBind(events) {
    const payload = []
    for (let i = 0; i < events.length; i++) {
      const e = events[i]
      this.bind(e[0], e[1])
      payload.push([e[0], e[2]])
    }
    return payload
  }
  batchBind_T(events) {
    const payload = this.batchBind(events)
    this.trigger(payload)
    return this
  }
  bind$(event, callback, handleMultiple) {
    this.unbind(event)
    this.bind(event, callback, handleMultiple)
    return this
  }
  bind_(event, callback, data, handleMultiple) {
    this.bind$(event, callback, handleMultiple)
    this.trigger([[event, data]])
    return this
  }
  /*bind_F(event, callback, data, handleMultiple, beforeEvent, changeNotice) {
    this.bind$(event, callback, handleMultiple)
    this.triggerFile(event, data, beforeEvent, changeNotice)
    return this
  }*/
  unbind(event) {
    this.callbacks[JSON.stringify(event)] = []
  }
  trigger(payload) {
    const f = this.trigger
    switch (this.conn.readyState) {
      case 0: // CONNECTING
        // code block
        //This will added to onopen list, take care
        this.conn.addEventListener('open', function() {
          f(payload)
        })
        return this
      case 1: // OPEN
        this.conn.send(JSON.stringify(payload)) // <= send JSON data to socket server
        return this
      case 2: // CLOSING
      case 3: //CLOSED
        // try to reconnect/logout
        this.setupConnection()
        this.conn.addEventListener('open', function() {
          f(payload)
        })
        return this
      default:
        return this
      // code block
    }
  }
  /* todo: fix typescript errors
  triggerFile(
    event,
    data,
    beforeEvent = ['auth', 'image_meta_data', 0],
    callback
  ) {
    const f = this.triggerFile
    const f2 = this.trigger
    switch (this.conn.readyState) {
      case 0: // CONNECTING
        // code block
        //This will added to onopen list, take care
        this.conn.addEventListener('open', function() {
          f(event, data)
        })
        return this
      case 1: // OPEN
        let file = data
        let reader = new FileReader()
        let rawData = new ArrayBuffer()
        const conn = this.conn
        const bind$ = this.bind$
        reader.loadend = function() {}
        reader.onload = function(e) {
          rawData = e.target.result
          // conn.binaryType = "arraybuffer"
          f2([[beforeEvent, [event, file.name, file.size, file.type]]])

          bind$(beforeEvent, () => {
            conn.send(rawData)

            if (callback) {
              let interval = setInterval(() => {
                if (conn.bufferedAmount > 0) {
                  callback(conn.bufferedAmount)
                } else {
                  callback(0)
                  clearInterval(interval)
                }
              }, 100)
            }
          })

          // conn.binaryType = "blob"
          //alert("the File has been transferred.")
        }
        reader.readAsArrayBuffer(file)

        return this
      case 2: // CLOSING
      case 3: //CLOSED
        // try to reconnect/logout
        this.conn = new WebSocket(this.path)
        this.conn.addEventListener('open', function() {
          f(event, data)
        })
        return this
      default:
        return this
      // code block
    }
  }*/
  stringHandle(data){
      try {
        for (let i = 0; i < data.length; i++) {
          const e = data[i]
          const event = e[0]
          const message = e.splice(1)
          this.dispatch(event, message)
        }
      } catch (error) {
        console.warn('error: ', error)
        console.warn(data)
      }
  }

  async onmessage(evt) {
    if (typeof evt.data === 'string') {
      const data = JSON.parse(evt.data)
      this.stringHandle(data)
    }
    // if(evt.data instanceof ArrayBuffer ){
    else {
      const blob = evt.data
      console.log(11, blob)
      const buffer = await blob.arrayBuffer();
      const data = M['default']['decode'](buffer)
      this.stringHandle(data)
      //console.log('Received arraybuffer')
      //this.dispatch(this.event, buffer) // uncomment
    }
    // if(evt.data instanceof Blob ){
    //   const buffer = event.data;
    //   console.log("Received arraybuffer");
    //   this.dispatch(this.event_name, buffer)
    // }
  }

  onclose(evt) {
    ws_connected.set(false)
    this.dispatch(['close', '', 0], null)
    setTimeout(() => {
      this.setupConnection()
    }, 1000)
    // on reconnection all subscribtion needs to resubscribe.
  }
  onopen(evt) {
    ws_connected.set(true)
    //console.log(this.conn.extensions);
    //console.log("Server Opened")
    this.dispatch(['open', '', 0], null)
  }
  onerror(error) {
    console.log(`[error] ${error.message}`)
    //todo depend on error try to reconnect
    this.dispatch(['error', '', 0], null)
  }

  dispatch(event, message) {
    const chain = this.callbacks[JSON.stringify(event)]
    if (typeof chain == 'undefined') {
      console.log("no callbacks for this event: ", event)
    } else {
      const length = chain.length;
      for (let i = 0; i < length; i++) {
        chain[i][1](message)
        if (chain[i][0] == 0) {
          this.callbacks[JSON.stringify(event)] = []
        }
      }
    }
  }
}

/*
export const ServerEventsDispatcher = function(){
    const conn = new IsomorphicWs('ws://localhost:8300/echo');

    const callbacks = {};

    this.bind = function(event_name, callback){
      callbacks[event_name] = callbacks[event_name] ?? [];
      callbacks[event_name].push(callback);
      return this;// chainable
    };

    this.trigger2 = function(event_name, data){
      const payload = JSON.stringify([event_name, data]);
      conn.send( payload ); // <= send JSON data to socket server
      return this;
    };

    // dispatch to the right handlers
    conn.onmessage = function(evt){
      const data = JSON.parse(evt.data),
          event_name = data[0],
          message = data[1];
      dispatch(event_name, message)
    };

    conn.onclose = function(){dispatch('close',null)}
    conn.onopen = function(){dispatch('open',null)}

    const dispatch = function(event_name, message){
      const chain = callbacks[event_name];
      if(typeof chain == 'undefined') return; // no callbacks for this event
      for(let i = 0; i < chain.length; i++){
        chain[i]( message )
      }
    }
  };
*/
