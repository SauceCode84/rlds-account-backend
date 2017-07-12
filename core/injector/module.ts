import { InstanceWrapper } from "./instance-wrapper.interface";
import { Controller, Injectable } from "../../common/interfaces";
import { IrisModuleMetatype } from "../../common/interfaces/modules";

export class Module {

  private _relatedModules = new Set<Module>();
  private _components = new Map<any, InstanceWrapper<Injectable>>();
  private _routes = new Map<string, InstanceWrapper<Controller>>();
  private _exports = new Set<string>();

  private _metatype: IrisModuleMetatype;
  private _scope: IrisModuleMetatype[];

  constructor(metatype: IrisModuleMetatype, scope: IrisModuleMetatype[]) {
    this._metatype = metatype;
    this._scope = scope;
    
    //this.addModuleRef
  }

  public get scope() {
    return this._scope;
  }

}
