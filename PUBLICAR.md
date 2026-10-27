# Como publicar o site (grátis) e usar no celular

O site é todo estático e não precisa de banco de dados, senhas nem variáveis de ambiente. Por isso dá para
hospedar de graça no plano **Hobby da Vercel**, que é gratuito para uso pessoal e não comercial.

O repositório git local já está criado, com o primeiro commit na branch `main`. Falta só enviar o código para a sua
conta e ligar a Vercel. Escolha **um** dos caminhos abaixo.

---

## Caminho A (recomendado): GitHub + Vercel

Neste caminho, toda alteração que você enviar para o GitHub é publicada sozinha.

### 1. Enviar o código para o GitHub

1. Entre em <https://github.com> (crie uma conta gratuita, se ainda não tiver).
2. Clique em **New repository**.
   - Nome sugerido: `passo-a-passo`.
   - Pode deixar **Private** (privado). A Vercel funciona com repositórios privados.
   - **Não** marque "Add a README" nem outras opções. O repositório precisa começar vazio.
3. Na pasta do projeto, rode os comandos abaixo, trocando `SEU-USUARIO` pelo seu usuário do GitHub:

```bash
git remote add origin https://github.com/SEU-USUARIO/passo-a-passo.git
```

```bash
git push -u origin main
```

No Windows, o Git abre uma janela do navegador para você entrar na sua conta do GitHub na primeira vez.

### 2. Publicar na Vercel

1. Entre em <https://vercel.com> e escolha **Continue with GitHub**. No cadastro, selecione o plano **Hobby** (grátis).
2. Clique em **Add New… → Project**.
3. Encontre o repositório `passo-a-passo` e clique em **Import**. Se ele não aparecer, autorize o acesso da Vercel a esse
   repositório quando ela pedir.
4. A Vercel reconhece sozinha que é um projeto **Next.js**. Não mude nada:
   - comando de build: `npm run build`;
   - nenhuma variável de ambiente.
5. Clique em **Deploy** e espere de 1 a 2 minutos.
6. Pronto! O endereço fica parecido com `https://passo-a-passo.vercel.app`. Se o nome já existir, a Vercel acrescenta
   um sufixo. Você pode trocar o nome do projeto em **Settings → General** **antes** de passar o link para sua mãe.
7. *(Opcional)* Para ligar o coletor diário de provas oficiais, siga a seção "Agendamento diário" do
   [COLETOR.md](COLETOR.md). Ela explica como criar o banco gratuito, cadastrar as variáveis e fazer um novo deploy.
   O script `scripts/configurar-vercel.ps1` cadastra as variáveis para você.
   - Sem isso, o site de estudos funciona normalmente, só sem as provas coletadas automaticamente.
   - Também sem isso, o painel `/admin` e o agendamento ficam desligados: as rotas respondem "não configurado".

### 3. Como atualizar depois

Altere o que quiser e rode:

```bash
npm run check
```

```bash
git add -A
```

```bash
git commit -m "Descreva a mudança"
```

```bash
git push
```

A Vercel publica a nova versão em 1 a 2 minutos. **O progresso da sua mãe continua salvo**, porque fica no celular
dela, e não no servidor.

---

## Caminho B: só a Vercel (sem GitHub)

Bom para publicar rápido. A desvantagem é que cada atualização precisa ser enviada à mão.

```bash
npx vercel
```

Na primeira vez, o comando pede para você entrar na sua conta da Vercel (abre o navegador) e faz algumas perguntas.
Pode aceitar as respostas sugeridas. Para publicar no endereço definitivo:

```bash
npx vercel --prod
```

Para atualizar depois, rode `npx vercel --prod` de novo.

---

## Testar no seu celular antes de publicar (opcional)

Com o celular e o computador **na mesma rede Wi-Fi**:

```bash
npm run build
```

```bash
npm run start
```

No celular, abra `http://IP-DO-COMPUTADOR:3000`. O endereço "Network" aparece quando você roda `npm run dev`; por
exemplo, `http://10.0.0.131:3000`. Se o Windows perguntar sobre o firewall, permita o acesso em **rede privada**.
Isso só funciona enquanto o computador estiver ligado com o servidor rodando.

---

## Cuidados importantes

- **Não troque o endereço do site depois que ela começar a usar.** O progresso fica salvo por endereço. Se o site mudar
  de `passo-a-passo.vercel.app` para outro nome ou domínio, o histórico não aparece no endereço novo. Nesse caso, ela
  precisaria baixar a cópia de segurança no endereço antigo e restaurá-la no novo.
- **Domínio próprio (opcional):** dá para ligar um domínio comprado em **Settings → Domains**. Faça isso antes de entregar
  o link, pelo mesmo motivo acima.
- **Nada pessoal vai para o servidor:** não há cadastro e as respostas ficam só no aparelho dela.
- **Outras hospedagens gratuitas** (Netlify, Cloudflare Pages) também funcionam com Next.js, mas este guia foi escrito
  para a Vercel, que é feita pelos criadores do Next.js.

---

## Guia para mandar para a sua mãe

> **Passo a Passo — seu site de estudos**
>
> 1. Abra este link no celular: **(cole aqui o endereço da Vercel)**
>    - No Android, use o **Chrome**.
>    - No iPhone, use o **Safari**.
> 2. Coloque o site na tela inicial, como um aplicativo:
>    - **Android (Chrome):** toque nos **três pontinhos ⋮** no canto de cima e escolha **"Adicionar à tela inicial"**
>      ou **"Instalar app"**.
>    - **iPhone (Safari):** toque no botão **Compartilhar** (o quadrado com uma setinha para cima) e escolha
>      **"Adicionar à Tela de Início"**.
> 3. Depois disso, **abra sempre pelo ícone "Passo a Passo"** da tela inicial. Seu progresso fica guardado nesse celular.
>    No iPhone, o ícone da tela de início guarda o progresso separado do Safari, então use sempre o ícone.
> 4. Para aumentar a letra, toque no botão **"Letra"** no alto da tela.
> 5. De vez em quando, entre em **Progresso → Baixar cópia de segurança** e guarde o arquivo, por exemplo mandando para
>    você mesma no WhatsApp ou no e-mail. Se trocar de celular, é só usar **Restaurar cópia de segurança**.
