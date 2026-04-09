import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, XCircle, Loader2 } from "lucide-react";

const SQL = `
CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL, block_type TEXT NOT NULL,
  block_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_blocks_slug ON public.page_blocks(page_slug, block_order);
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_blocks' AND policyname='Anyone can read page blocks') THEN
    CREATE POLICY "Anyone can read page blocks" ON public.page_blocks FOR SELECT TO public USING (true);
    CREATE POLICY "Anyone can insert page blocks" ON public.page_blocks FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Anyone can update page blocks" ON public.page_blocks FOR UPDATE TO public USING (true) WITH CHECK (true);
    CREATE POLICY "Anyone can delete page blocks" ON public.page_blocks FOR DELETE TO public USING (true);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY, value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Anyone can read settings') THEN
    CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
    CREATE POLICY "Anyone can upsert settings" ON public.site_settings FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Anyone can update settings" ON public.site_settings FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), filename TEXT NOT NULL, url TEXT NOT NULL,
  alt_text TEXT, media_type TEXT NOT NULL DEFAULT 'image', file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Anyone can read media') THEN
    CREATE POLICY "Anyone can read media" ON public.media_library FOR SELECT TO public USING (true);
    CREATE POLICY "Anyone can insert media" ON public.media_library FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Anyone can delete media" ON public.media_library FOR DELETE TO public USING (true);
    CREATE POLICY "Anyone can update media" ON public.media_library FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), section_id text NOT NULL, field_key text NOT NULL,
  text_value text, image_url text, updated_at timestamptz DEFAULT now(), UNIQUE(section_id, field_key)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Anyone can read site content') THEN
    CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert site content" ON public.site_content FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update site content" ON public.site_content FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Anyone can delete site content" ON public.site_content FOR DELETE USING (true);
  END IF;
END $$;
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true) ON CONFLICT DO NOTHING;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Public read site images') THEN
    CREATE POLICY "Public read site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
    CREATE POLICY "Anyone upload site images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images');
    CREATE POLICY "Anyone update site images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');
    CREATE POLICY "Anyone delete site images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images');
  END IF;
END $$;
`;

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface Step { label: string; desc: string; status: StepStatus; }

const initSteps: Step[] = [
  { label: 'Create Supabase project', desc: 'Waiting...', status: 'pending' },
  { label: 'Wait for database to be ready', desc: 'Waiting...', status: 'pending' },
  { label: 'Run database schema', desc: 'Waiting...', status: 'pending' },
  { label: 'Create Vercel project', desc: 'Waiting...', status: 'pending' },
  { label: 'Set environment variables', desc: 'Waiting...', status: 'pending' },
  { label: 'Deploy site', desc: 'Waiting...', status: 'pending' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function randPass() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 20 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

const Provisioner = () => {
  const [supaToken, setSupaToken] = useState('');
  const [supaOrg, setSupaOrg] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [vercelTeam, setVercelTeam] = useState('');
  const [githubRepo, setGithubRepo] = useState('digitalnativepalawan/pebble-site');
  const [bname, setBname] = useState('');
  const [bemail, setBemail] = useState('');
  const [dbPass] = useState(randPass());
  const [steps, setSteps] = useState<Step[]>(initSteps);
  const [running, setRunning] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [clientMsg, setClientMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSupaToken(localStorage.getItem('prov_supa_token') || '');
    setSupaOrg(localStorage.getItem('prov_supa_org') || '');
    setVercelToken(localStorage.getItem('prov_vercel_token') || '');
    setVercelTeam(localStorage.getItem('prov_vercel_team') || '');
    setGithubRepo(localStorage.getItem('prov_github_repo') || 'digitalnativepalawan/pebble-site');
  }, []);

  const saveKeys = () => {
    localStorage.setItem('prov_supa_token', supaToken);
    localStorage.setItem('prov_supa_org', supaOrg);
    localStorage.setItem('prov_vercel_token', vercelToken);
    localStorage.setItem('prov_vercel_team', vercelTeam);
    localStorage.setItem('prov_github_repo', githubRepo);
  };

  const updateStep = (i: number, status: StepStatus, desc: string) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status, desc } : s));
  };

  const provision = async () => {
    if (!bname.trim()) return setError('Please enter a business name');
    if (!supaToken || !supaOrg) return setError('Please add your Supabase token and org ID');
    if (!vercelToken || !vercelTeam) return setError('Please add your Vercel token and team ID');

    saveKeys();
    setRunning(true);
    setError('');
    setSiteUrl('');
    setSteps(initSteps.map(s => ({ ...s, status: 'pending', desc: 'Waiting...' })));

    const slug = slugify(bname.trim());
    const projName = slug + '-site';
    let supaRef = '', supaUrl = '', supaKey = '';

    try {
      // Step 1
      updateStep(0, 'running', 'Creating Supabase project...');
      const r1 = await fetch('https://api.supabase.com/v1/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${supaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projName, organization_id: supaOrg, db_pass: dbPass, region: 'ap-southeast-1', plan: 'free' })
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error('Supabase: ' + (d1.message || JSON.stringify(d1)));
      supaRef = d1.ref;
      supaUrl = `https://${supaRef}.supabase.co`;
      updateStep(0, 'done', `Created: ${supaRef}`);

      // Step 2
      updateStep(1, 'running', 'Waiting for database (~60s)...');
      let healthy = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const hr = await fetch(`https://api.supabase.com/v1/projects/${supaRef}/health`, {
          headers: { Authorization: `Bearer ${supaToken}` }
        });
        const hd = await hr.json();
        const db = Array.isArray(hd) ? hd.find((s: any) => s.name === 'db') : null;
        updateStep(1, 'running', `Checking... ${db?.status || 'waiting'} (${(i + 1) * 5}s)`);
        if (db?.status === 'ACTIVE_HEALTHY') { healthy = true; break; }
      }
      if (!healthy) throw new Error('Database did not become ready in time. Check Supabase dashboard.');
      updateStep(1, 'done', 'Database is ready');

      // Step 3
      updateStep(2, 'running', 'Getting API keys...');
      const kr = await fetch(`https://api.supabase.com/v1/projects/${supaRef}/api-keys`, {
        headers: { Authorization: `Bearer ${supaToken}` }
      });
      const keys = await kr.json();
      const key = (Array.isArray(keys) ? keys : []).find((k: any) => k.name === 'anon' || k.name === 'publishable');
      if (!key) throw new Error('Could not get Supabase anon key');
      supaKey = key.api_key;

      updateStep(2, 'running', 'Running schema SQL...');
      const sr = await fetch(`https://api.supabase.com/v1/projects/${supaRef}/database/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${supaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: SQL })
      });
      if (!sr.ok) throw new Error('SQL failed: ' + await sr.text());
      updateStep(2, 'done', 'Schema created');

      // Step 4
      updateStep(3, 'running', 'Creating Vercel project...');
      const vr = await fetch(`https://api.vercel.com/v10/projects?teamId=${vercelTeam}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projName, framework: 'vite', gitRepository: { type: 'github', repo: githubRepo } })
      });
      const vd = await vr.json();
      if (!vr.ok) throw new Error('Vercel: ' + (vd.error?.message || JSON.stringify(vd)));
      const vProjId = vd.id;
      updateStep(3, 'done', `Created: ${projName}`);

      // Step 5
      updateStep(4, 'running', 'Setting env vars...');
      for (const env of [
        { key: 'VITE_SUPABASE_URL', value: supaUrl },
        { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', value: supaKey },
      ]) {
        await fetch(`https://api.vercel.com/v10/projects/${vProjId}/env?teamId=${vercelTeam}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: env.key, value: env.value, type: 'plain', target: ['production', 'preview'] })
        });
      }
      updateStep(4, 'done', 'Environment variables set');

      // Step 6
      updateStep(5, 'running', 'Triggering deployment...');
      const [ghOwner, ghRepo] = githubRepo.split('/');
      const dr = await fetch(`https://api.vercel.com/v13/deployments?teamId=${vercelTeam}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projName, target: 'production', gitSource: { type: 'github', repo: ghRepo, ref: 'main', org: ghOwner } })
      });
      const dd = await dr.json();
      if (!dr.ok) throw new Error('Deploy: ' + (dd.error?.message || JSON.stringify(dd)));
      updateStep(5, 'done', 'Deploying — live in ~2 minutes');

      const url = `https://${projName}.vercel.app`;
      setSiteUrl(url);
      setClientMsg(`Hi! Your website is ready.\n\nYour site: ${url}\nAdmin panel: ${url}/admin\n\nWhen you first visit the admin:\n1. Enter your business name and tagline\n2. Create your passkey\n3. Start building your site\n\nLet me know if you need help!`);

    } catch (e: any) {
      setError(e.message);
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error', desc: e.message } : s));
    }
    setRunning(false);
  };

  const StepIcon = ({ status }: { status: StepStatus }) => {
    if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
    if (status === 'running') return <Loader2 className="w-5 h-5 text-amber-500 shrink-0 animate-spin" />;
    return <Circle className="w-5 h-5 text-muted-foreground shrink-0" />;
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground mb-1">🚀 Launch New Client Site</h3>
        <p className="font-body text-xs text-muted-foreground">Fill in client details and your API keys — the rest is automatic.</p>
      </div>

      {/* API Keys */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your API Keys (saved locally)</p>
        <div>
          <label className="font-body text-xs text-muted-foreground">Supabase Personal Access Token</label>
          <Input type="password" value={supaToken} onChange={e => setSupaToken(e.target.value)} placeholder="sbp_..." className="mt-1" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground">Supabase Organization ID</label>
          <Input value={supaOrg} onChange={e => setSupaOrg(e.target.value)} placeholder="org_..." className="mt-1" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground">Vercel Token</label>
          <Input type="password" value={vercelToken} onChange={e => setVercelToken(e.target.value)} placeholder="..." className="mt-1" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground">Vercel Team ID</label>
          <Input value={vercelTeam} onChange={e => setVercelTeam(e.target.value)} placeholder="team_..." className="mt-1" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground">GitHub repo (pebble-site)</label>
          <Input value={githubRepo} onChange={e => setGithubRepo(e.target.value)} className="mt-1" />
        </div>
      </div>

      {/* Client info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Client</p>
        <div>
          <label className="font-body text-xs text-muted-foreground">Business name</label>
          <Input value={bname} onChange={e => setBname(e.target.value)} placeholder="e.g. Sunset Cove Resort" className="mt-1" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground">Client email (optional)</label>
          <Input type="email" value={bemail} onChange={e => setBemail(e.target.value)} placeholder="client@email.com" className="mt-1" />
        </div>
      </div>

      {error && <p className="font-body text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

      <Button onClick={provision} disabled={running} className="w-full font-display tracking-wider h-12">
        {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning...</> : '🚀 Launch Client Site'}
      </Button>

      {/* Steps */}
      {steps.some(s => s.status !== 'pending') && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <StepIcon status={step.status} />
              <div>
                <p className="font-body text-sm font-medium text-foreground">{step.label}</p>
                <p className="font-body text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {siteUrl && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-3">
          <p className="font-display text-sm font-semibold text-green-500">✅ Site is live!</p>
          <div>
            <label className="font-body text-xs text-muted-foreground">Site URL</label>
            <div className="flex gap-2 mt-1">
              <Input value={siteUrl} readOnly className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(siteUrl)}>Copy</Button>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground">Admin URL</label>
            <div className="flex gap-2 mt-1">
              <Input value={siteUrl + '/admin'} readOnly className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(siteUrl + '/admin')}>Copy</Button>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground">Message for client</label>
            <textarea value={clientMsg} readOnly className="w-full mt-1 rounded-lg border border-border bg-background p-3 font-body text-xs text-foreground resize-none h-32" />
            <Button size="sm" variant="outline" className="mt-1" onClick={() => navigator.clipboard.writeText(clientMsg)}>Copy message</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Provisioner;
