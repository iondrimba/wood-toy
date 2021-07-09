import App from './app';

try {
  new App().init();

  if (module.hot) {
    module.hot.accept('./app', () => {
      new App().init();
    });
  }
} catch (error) {
  console.log(error);
}
