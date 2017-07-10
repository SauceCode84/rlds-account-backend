import { Module } from "../common/module.decorator";
import { Component } from "../common/component.decorator";
import { Controller } from "../common/controller.decorator";

@Component()
export class UserService {

}

@Controller("users")
export class UserController {

  constructor(private service: UserService) {
  }

}

@Module({
  controllers: [UserController],
  components: [UserService]
})
export class ApplicationModule { }
