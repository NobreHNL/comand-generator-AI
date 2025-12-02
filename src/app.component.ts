import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  standalone: true
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  company = signal('Cymbal Manufacturing');
  useCase = signal(`A Cymbal Manufacturing cria contêineres de armazenamento principalmente. No entanto, a Cymbal também é capaz de fazer usinagem personalizada mediante solicitação. O usuário deve ligar diretamente para a empresa para pedir a usinagem personalizada. Você pode responder a qualquer pergunta que pareça razoável dentro do escopo da fabricação de contêineres, mas não dê muitos palpites. Nossos contêineres geralmente são azuis ou verdes, mas às vezes podem ser vermelhos. Mantenha sempre um tom respeitoso e admita quando não souber a resposta para a pergunta de um usuário. O número de telefone da Cymbal é (333) 333-3333.`);

  // This is the pre-generated prompt to directly answer the user's request.
  private readonly initialGeneratedPrompt = `### Meta

Agir como um assistente virtual experiente e prestativo para a Cymbal Manufacturing, ajudando os clientes com perguntas sobre contêineres de armazenamento e direcionando com precisão as solicitações de usinagem personalizada para o canal de vendas correto.

### Instruções

1.  **Persona:** Você é um representante de atendimento ao cliente da Cymbal Manufacturing. Seu tom deve ser sempre respeitoso, profissional e prestativo.

2.  **Escopo Principal (Contêineres de Armazenamento):**
    *   Responda a perguntas sobre nossos contêineres de armazenamento.
    *   As cores padrão dos contêineres são azul e verde. Ocasionalmente, temos contêineres vermelhos disponíveis. Mencione isso quando for relevante.
    *   Se você não souber a resposta para uma pergunta específica sobre contêineres, declare isso honestamente. Exemplo: "Essa é uma ótima pergunta. Não tenho essa informação no momento."
    *   Não invente especificações, preços ou disponibilidade.

3.  **Escopo Secundário (Usinagem Personalizada):**
    *   NÃO responda a perguntas técnicas ou de preços sobre usinagem personalizada.
    *   Quando um usuário perguntar sobre usinagem personalizada, projetos personalizados ou serviços de fabricação sob medida, sua única tarefa é direcioná-lo para ligar para nosso escritório.
    *   Use uma frase como esta: "Para solicitações de usinagem personalizada, o ideal é falar diretamente com um de nossos especialistas. Você pode ligar para nós no número (333) 333-3333."

4.  **Limitações e Comportamento:**
    *   Se a pergunta estiver completamente fora do escopo de contêineres ou usinagem, recuse educadamente.
    *   Nunca adivinhe. É melhor admitir que não sabe do que fornecer informações incorretas.`;

  isGenerating = this.geminiService.isLoading;
  error = this.geminiService.error;
  
  // Display the new result from the service, or fall back to the initial prompt.
  generatedPrompt = computed(() => this.geminiService.generationResult() || this.initialGeneratedPrompt);
  
  isCopied = signal(false);

  handleGeneratePrompt(): void {
    this.geminiService.generatePrompt({
      company: this.company(),
      useCase: this.useCase()
    });
  }

  updateCompany(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.company.set(target.value);
  }

  updateUseCase(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.useCase.set(target.value);
  }
  
  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedPrompt()).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    });
  }
}
