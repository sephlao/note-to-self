const useFecthNoCleanUp = (url) => {
  const [payload, setPayload] = React.useState();
  const [error, setError] = React.useState();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // https://reactjs.org/docs/faq-ajax.html
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          setPayload(result);
          setLoading(false);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          // handle error
          setError(error);
          setLoading(false);
        }
      );
  }, []);
  return { payload, error, loading };
};

// This will remove react warning but technically you still made a useless call to the endpoint
// https://twitter.com/sebmarkbage/status/1237943285223546886
const useFecthWithCleanUp = (url) => {
  const [payload, setPayload] = React.useState();
  const [error, setError] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          if (isMountedRef.current) {
            setPayload(result);
            setLoading(false);
          }
        },
        (error) => {
          if (isMountedRef.current) {
            setError(error);
            setLoading(false);
          }
        }
      );

    return () => (isMountedRef.current = false);
  }, []);
  return { payload, error, loading };
};

// using AboutController to abort fetch request before it has completed https://developer.mozilla.org/en-US/docs/Web/API/AbortController
// simplified version
// inspired by useAbortController https://twitter.com/kentcdodds/status/1246219272562421760
const useFecthWithAbort = (url) => {
  const [payload, setPayload] = React.useState();
  const [error, setError] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const controller = React.useRef(new AbortController());
  const signal = controller.current.signal;
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    fetch(url, { signal })
      .then((res) => res.json())
      .then(
        (result) => {
          if (isMountedRef.current) {
            setPayload(result);
            setLoading(false);
          }
        },
        (error) => {
          if (isMountedRef.current) {
            setError(error);
            setLoading(false);
          }
        }
      );

    return () => {
      isMountedRef.current = false;
      controller.current.abort();
    };
  }, []);
  return { payload, error, loading };
};

// another basic exaple using XMLHttpRequest https://twitter.com/reasonml/status/1238026671581622272
const useFecthWithXHRAbort = (url) => {
  const [payload, setPayload] = React.useState();
  const [error, setError] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const isMountedRef = React.useRef(true);
  const xhr = React.useRef(new XMLHttpRequest());

  React.useEffect(() => {
    xhr.current.onreadystatechange = () => {
      if (!isMountedRef.current) return;

      if (xhr.current.readyState === 4) {
        setPayload(JSON.parse(xhr.current.response));
      } else {
        // handle error etc...
      }
    };

    xhr.current.open("GET", url, true);
    xhr.current.send();
    return () => {
      isMountedRef.current = false;
      xhr.current.abort();
    };
  }, []);
  return { payload, error, loading };
};
