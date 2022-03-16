/* ammostats.js
 * license: NCSA
 * copyright: Faupi
 * authors:
 * - Faupi
 */

"use strict";
const path = require('path');
const cfg = require("./config.json");
const DATABASE = DatabaseServer.tables.templates.items;

class AmmoStats {
    constructor() {
        this.mod = require("../package.json");
        this.translations = require("../res/translations.json");
        Logger.info(`Loading: ${this.mod.name} ${this.mod.version}`);
        
        ModLoader.onLoad[this.mod.name] = this.init.bind(this);
    }

    init(){
        this.hookRoutes();
        this.updateLocalization();
        this.changeBulletColour();
    }

    updateLocalization(){
        var globalLocale = DatabaseServer.tables.locales.global;

        for(let language in this.translations){
            if(!language in globalLocale) continue;

            let attrKvPair = this.translations[language];
            for(let attrKey in attrKvPair){
                let attrValue = attrKvPair[attrKey];

                globalLocale[language].interface[attrKey] = attrValue;
            }
        }
    }

    hookRoutes(){
        HttpRouter.onStaticRoute["/MunitionsExpert/GetInfo"] = {
            MunitionsExpert: this.getModInfo.bind(this)
        };
    }

    getModInfo(url, info, sessionID, output){
        var output = {
            status: 1,
            data: null
        };

        // Don't mind this pointless try catch
        try{
            output.data = {...this.mod, ...{path: path.resolve(ModLoader.getModPath(this.mod.name))}};
            output.status = 0;
        }catch(ex){
            throw ex;
        }
        
        return JsonUtil.serialize(output);
    }

    changeBulletColour()
    {
        if(cfg.BulletBackgroundColours === true)
        {
            for (const i in DATABASE) {
                let item = DATABASE[i]
            
                //set baground colour of ammo depending on pen
                if (item._parent === "5485a8684bdc2da71d8b4567") {
                    let pen = item._props.PenetrationPower
                    let colour = ""
            
                    pen > 60 ? colour = "red" : //SuperPen 
                        pen > 50 ? colour = "yellow" : //HighPen 
                        pen > 40 ? colour = "violet" : //MedHighPen 
                        pen > 30 ? colour = "blue" : //MedPen 
                        pen > 20 ? colour = "green" : //LowMedPen 
                        colour = "grey" //LowPen 
                    item._props.BackgroundColor = colour
                }
            }
        }
    }
}

module.exports = new AmmoStats();