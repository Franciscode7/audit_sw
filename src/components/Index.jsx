import { useNavigate } from "react-router-dom";
import { questions as Q1 } from "../data/audit-v1/questions";
import { questions as Q2 } from "../data/audit-v2/questions";
// import { questions as Q3 } from "../data/audit-v3/questions";
// import { questions as Q4 } from "../data/audit-v4/questions";

function Index() {
  const navigate = useNavigate();

  console.log(Q1[0].options[0]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const categoria = e.target.categoria.value;

        if (categoria) {
          navigate(`formulario?categoria=${categoria}`);
        }
      }}
      className="pt-8"
    >
      <select name="categoria" defaultValue="">
        <option value="" disabled>
          -- Selecciona --
        </option>

        <option value="AuditV1">Auditoria V1</option>
        <option value="AuditV2">Auditoria V2</option>
        <option value="AuditV3">Auditoria V33</option>
      </select>

      <br /><br />

      <input type="submit" value="Empezar" />
    </form>
  );
}

export default Index;