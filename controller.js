import world from "./model.js";
import { initView } from "./view.js";

let els;

export async function init() {
    els = initView();

    const resp = await fetch('./db.json')
    const data = await resp.json();

    Object.values(data.items).forEach()
}