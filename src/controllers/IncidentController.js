const connection = require("../database/connection");

module.exports = {
  async create(request, response) {
    const { title, description, value } = request.body;

    const ong_id = request.headers.authorization;

    const [id] = await connection("incidents").insert({
      ong_id,
      title,
      description,
      value
    });

    return response.json({ id });
  },

  async index(request, response) {
    const { page = 1 } = request.query;

    const [count] = await connection("incidents").count();

    const incidents = await connection("incidents")
      .join("ongs", "ongs.id", "=", "incidents.ong_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        "incidents.*",
        "ongs.name",
        "ongs.email",
        "ongs.whatsapp",
        "ongs.city",
        "ongs.uf"
      ]);

    response.header("X-Total-Count", count["count(*)"]);

    return response.json(incidents);
  },

  async delete(request, response) {
    const { id } = request.params;
    const ong_id = request.headers.authorization;

    const incident = await connection("incidents")
      .where("id", id)
      .select("ong_id")
      .first();

    if (!incident) {
      return response.status(400).json({
        error: "Esse incidente não existe forneça um id válido"
      });
    }

    if (incident.ong_id !== ong_id) {
      return response.status(401).json({
        error: "Ops.. essa ong não foi a mesma que criou esse caso"
      });
    }

    await connection("incidents")
      .where("id", id)
      .delete();

    return response.status(200).json({ success: "Caso deletado com sucesso" });
  }
};
