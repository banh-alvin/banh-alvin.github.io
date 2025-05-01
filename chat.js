export function Chat() {
  return {
    props: ['chatId'],
    template: `
      <h2>Chat {{ chatId }}</h2>
      <p>This is chat number {{ chatId }}.</p>
    `,
  };
}