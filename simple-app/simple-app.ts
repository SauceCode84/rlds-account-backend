import { Component } from "../common/utils/decorators/component.decorator";
import { Controller } from "../common/utils/decorators/controller.decorator";
import { Module } from "../common/utils/decorators/module.decorator";

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
