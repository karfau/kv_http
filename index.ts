import * as os from 'node:os';
import * as process from 'node:process';

Deno.serve(async (req) => {
  return new Response(`(${os.platform()} ${os.release()}-${os.arch()}; Deno ${process.version})`)
});
