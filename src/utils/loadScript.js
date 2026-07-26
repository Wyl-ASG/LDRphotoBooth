export const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });
};
