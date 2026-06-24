import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DynamicControlComponent } from "./components";

@NgModule({
    imports: [CommonModule],
    declarations: [DynamicControlComponent],
    exports: [DynamicControlComponent],
})
export class SharedModule {

}