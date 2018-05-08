import * as path from "path";
import * as fs from "fs";
import * as express from "express";

class Router {

  private startFolder: string = null;

  load(app: express.Application, folderName: string) {
    console.log("folderName", folderName);

    if (!this.startFolder) {
      this.startFolder = path.basename(folderName);
    }

    fs.readdirSync(folderName)
      .forEach(file => {
        const fullName = path.join(folderName, file);
        const stat = fs.lstatSync(fullName);

        if (stat.isDirectory()) {
          // loop through folders
          this.load(app, fullName);
        } else if (file.toLowerCase().indexOf(".js")) {
          let dirs = path.dirname(fullName).split(path.sep);

          if (dirs[0].toLowerCase() === this.startFolder.toLowerCase()) {
            dirs.splice(0, 1);
          }

          const router = express.Router();

          // generate the route
          const baseRoute = "/" + dirs.join("/");
          console.log(`create route: ${ baseRoute } for ${ fullName }`);

          // load the JS file and inject router
          const controllerClass = require("./" + fullName);
          const controller = new controllerClass(router);

          app.use(baseRoute, router);
        }
      });
  }

}

export const router = new Router();
