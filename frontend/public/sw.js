self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon,
    data: {
      url: data.url,
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
