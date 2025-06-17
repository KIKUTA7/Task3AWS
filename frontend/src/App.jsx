import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api')
      .then((res) => res.text())
      .then((text) => setData(text));
  }, []);

  return <h1>Message from Backend: {data}</h1>;
}

export default App;
