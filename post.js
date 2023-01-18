'use strict'
const url = require('url')
class Obj {

    // Agafa les dades que arriben d'una crida POST i retorna un objecte JSON
    static getPostObject (request) {
        return new Promise(async (resolve, reject) => {
            let body = '',
                error = null

            request.on('data', (data) => { body = body + data.toString() })
            request.on('close', () => { /* TODO - Client closed connection, destroy everything! */ })
            request.on('error', (err) => { error = 'Error getting data' })
            request.on('end', async () => {
                let rst = null
                if (error !== null) {
                    console.log('Error getting data from post: ', error)
                    return reject(error)
                } else {
                    try {
                        let params;
                        let objPost;
                        if (body.charAt(0) == '{') {
                            // POST from AJAX
                            try {
                                objPost = JSON.parse(body)
                            } catch (e) {
                                console.log('Error parsing JSON from: ', body)
                            }
                        } else {
                            // POST from form
                            params = new URLSearchParams(body)
                            objPost = Object.fromEntries(params)
                        }                     
                        let keys = Object.keys(objPost)
                        for (let cnt = 0; cnt < keys.length; cnt = cnt + 1) {
                            let value = objPost[keys[cnt]]
                            let valueInt = parseInt(value)
                            let valueFlt = parseFloat(value)
                            if (valueInt && valueFlt) {
                                if (valueInt == valueFlt) objPost[keys[cnt]] = valueInt
                                else objPost[keys[cnt]] = valueFlt
                            }
                        }
                        return resolve(objPost)
                    } catch (e) {
                        console.log('Error parsing data from post: ', error)
                        return reject(e)
                    }
                    
                }
            })
        })
    }
}

// Export
module.exports = Obj
