import { Component, inject } from "@angular/core";
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { TextFieldModule } from "@angular/cdk/text-field";
import { ClipboardModule } from "@angular/cdk/clipboard";

import { aesEncrypt, aesDecrypt } from "./aes";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TextFieldModule,
    ClipboardModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected masterPasswordHidden = true;
  protected readonly masterPasswordControl = this.formBuilder.control(
    "",
    Validators.required
  );

  protected readonly encryptForm = this.formBuilder.group({
    textToEncrypt: ["", Validators.required],
    encryptedText: "",
  });

  protected readonly decryptForm = this.formBuilder.group({
    textToDecrypt: ["", Validators.required],
    decryptedText: "",
  });

  protected async encrypt(): Promise<void> {
    if (this.encryptForm.invalid) return;

    const encrypted = await aesEncrypt(
      this.encryptForm.controls.textToEncrypt.value,
      this.masterPasswordControl.value
    );

    this.encryptForm.controls.encryptedText.setValue(encrypted);
  }

  protected async decrypt(): Promise<void> {
    if (this.decryptForm.invalid) return;

    const decrypted = await aesDecrypt(
      this.decryptForm.controls.textToDecrypt.value,
      this.masterPasswordControl.value
    ).catch(() => {
      alert("Failed to decrypt text. Please check your master password.");
    });

    if (!decrypted) return;

    this.decryptForm.controls.decryptedText.setValue(decrypted);
  }

  protected clearForm(form: FormGroup): void {
    form.reset();
  }
}
