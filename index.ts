/// <reference lib="deno.unstable" />
const accessToken = Deno.env.get("ACCESS_TOKEN");

const kv = await Deno.openKv();

const usage = (url: string) => `
<html>
<body>
<h2>Usage</h2>
<pre>
  curl '${url}'
    -X POST 
    -H "Authorization: Bearer $KV_ACCESS_TOKEN"
    -d '{"method": "set", "params": {"key": ["user"], "value": "pomdtr"}}'
</pre>
</body>
</html>
`;

Deno.serve(async (req) => {
  if (req.method === "GET") {
    return new Response(usage(req.url), {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return new Response("unauthorized", { status: 403 });
  }

  const [, token] = authorization.split(" ");
  if (!token || token != accessToken) {
    console.log(token, accessToken);
    return new Response("unauthorized", { status: 403 });
  }

  const { method, params } = await req.json();
  if (!method || !params) {
    return new Response("method and params are required", { status: 400 });
  }

  switch (method) {
    case "get": {
      const { key, options } = params;
      if (!key) {
        return new Response("key is required", { status: 400 });
      }

      const value = await kv.get(key, options);
      return Response.json(value);
    }
    case "getMany": {
      const { keys, options } = params;
      if (!keys) {
        return new Response("keys is required", { status: 400 });
      }

      const values = await kv.getMany(keys, options);
      return Response.json(values);
    }
    case "list": {
      const { selector, options } = params;
      const entries = await kv.list(selector, options);
      return Response.json(entries);
    }
    case "set": {
      const { key, value, options } = params;
      const res = await kv.set(key, value, options);
      return Response.json(res);
    }
    case "delete": {
      const { key } = params;
      await kv.delete(key);
      return Response.json({ ok: true });
    }
    default: {
      return new Response("method not found", { status: 404 });
    }
  }
});
