import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { PublicService } from "./public.service";

@Public()
@Controller("public")
export class PublicController {
  constructor(private service: PublicService) {}

  @Get("menu")
  menu() {
    return this.service.menu();
  }
}