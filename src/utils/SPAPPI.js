import { useState } from 'react';

const API_URL = 'http://localhost:3002/'


export async function checkUser(data){
    let res = await SPAPI(API_URL + 'login', 'POST', data);
    return res;
}
export async function insertItem(table, data){
    let res = await SPAPI(API_URL + 'nuevo-' + table, 'POST', data);
    return res;
}
export async function getItems(table){
    let res = await SPAPI(API_URL + table, 'GET');
    return res;
}

export async function deleteItem(table, id){
    let res = await SPAPI(API_URL + 'eliminar-' + table + '/' + id, 'DELETE');
    return res;
}

export async function updateItem(table, data){
    let res = await SPAPI(API_URL + 'editar-' + table, 'POST', data);
    return res;
}

async function SPAPI(url, method, data){
    if(!data)
        data = {};


    let params = {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
    }

    if(method !== 'GET'){
        params.body = JSON.stringify(data);
    }

    let res = await fetch(url, params);

    return await res.json();
}