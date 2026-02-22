export default function AdminHome() {
  return (
    <div className="card">
      <h1 className="h1">Bem-vindo ao Admin</h1>
      <p className="muted">
        Aqui você gerencia <b>Categorias</b>, <b>Produtos</b> e <b>Configurações</b>.
      </p>

      <div className="hr" />

      <div className="row">
        <div className="badge">1) Cadastre categorias</div>
        <div className="badge">2) Cadastre produtos com foto</div>
        <div className="badge">3) Ajuste WhatsApp e horários</div>
      </div>
    </div>
  );
}