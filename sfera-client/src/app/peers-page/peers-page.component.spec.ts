import { ComponentFixture, TestBed } from "@angular/core/testing"

import { PeersPageComponent } from "./peers-page.component"

describe("PeersPageComponent", () => {
	let component: PeersPageComponent
	let fixture: ComponentFixture<PeersPageComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ PeersPageComponent ]
		})
			.compileComponents()

		fixture = TestBed.createComponent(PeersPageComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
