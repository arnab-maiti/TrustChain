const pool = require("../config/db");
const AppError = require("../src/utils/AppError");

const createRequirement = async ({customerId,title,description,specifications}) =>{
     const result = await pool.query(
        "Insert into requirements (customer_id,title,description,specifications) values ($1,$2,$3,$4) returning *",
        [customerId,title,description,specifications]
     )
     return result.rows[0];
}
const getRequirementsById = async(id,requestingUser)=>{
    const [result] = await pool.query(
        "select * from requirements where id = $1",
        [id]
    )
    if(result.rows.length === 0){
        throw new AppError("Requirement not found",404)
    }
    const isAuthorized =
        requirement.customer_id === requestingUser.id ||
        requirement.retailer_id === requestingUser.id ||
        requirement.manufacturer_id === requestingUser.id ||
        requestingUser.role === "admin";

    if (!isAuthorized) {
        throw new AppError("Unauthorized access", 403);
    }
    return result.rows[0];
}
const listRequirementsForUser = async (user) => {
  let column;

  if (user.role === "customer") column = "customer_id";
  else if (user.role === "retailer") column = "retailer_id";
  else if (user.role === "manufacturer") column = "manufacturer_id";
  else throw new AppError("Role not permitted to list requirements", 403);

  const result = await pool.query(
    `SELECT * FROM requirements WHERE ${column} = $1 ORDER BY created_at DESC`,
    [user.id],
  );

  return result.rows;
};
const assignParticipants = async (requirementId, customerId, retailerId, manufacturerId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reqResult = await client.query(
      "SELECT * FROM requirements WHERE id = $1 FOR UPDATE",
      [requirementId],
    );
    const requirement = reqResult.rows[0];

    if (!requirement) throw new AppError("Requirement not found", 404);
    if (requirement.customer_id !== customerId) {
      throw new AppError("Not authorized to assign this requirement", 403);
    }
    if (requirement.status !== "draft") {
      throw new AppError(`Cannot assign participants from status '${requirement.status}'`, 400);
    }

    const roleCheck = await client.query(
      `SELECT id, role FROM users WHERE id IN ($1, $2)`,
      [retailerId, manufacturerId],
    );
    const retailerUser = roleCheck.rows.find((u) => u.id === retailerId);
    const manufacturerUser = roleCheck.rows.find((u) => u.id === manufacturerId);

    if (!retailerUser || retailerUser.role !== "retailer") {
      throw new AppError("retailer_id must belong to a user with role 'retailer'", 400);
    }
    if (!manufacturerUser || manufacturerUser.role !== "manufacturer") {
      throw new AppError("manufacturer_id must belong to a user with role 'manufacturer'", 400);
    }

    const updateResult = await client.query(
      `UPDATE requirements
       SET retailer_id = $1,
           manufacturer_id = $2,
           customer_approved = TRUE,
           status = 'pending_approval'
       WHERE id = $3
       RETURNING *`,
      [retailerId, manufacturerId, requirementId],
    );

    await client.query("COMMIT");
    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const approveRequirement = async (requirementId, user) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reqResult = await client.query(
      "SELECT * FROM requirements WHERE id = $1 FOR UPDATE",
      [requirementId],
    );
    const requirement = reqResult.rows[0];

    if (!requirement) throw new AppError("Requirement not found", 404);
    if (requirement.status !== "pending_approval") {
      throw new AppError(`Cannot approve a requirement in status '${requirement.status}'`, 400);
    }

    let approvalColumn;
    if (user.role === "retailer" && requirement.retailer_id === user.id) {
      approvalColumn = "retailer_approved";
    } else if (user.role === "manufacturer" && requirement.manufacturer_id === user.id) {
      approvalColumn = "manufacturer_approved";
    } else {
      throw new AppError("Not authorized to approve this requirement", 403);
    }

    const updateResult = await client.query(
      `UPDATE requirements SET ${approvalColumn} = TRUE WHERE id = $1 RETURNING *`,
      [requirementId],
    );
    let updated = updateResult.rows[0];

    if (updated.customer_approved && updated.retailer_approved && updated.manufacturer_approved) {
      const lockResult = await client.query(
        `UPDATE requirements SET status = 'locked', locked_at = NOW() WHERE id = $1 RETURNING *`,
        [requirementId],
      );
      updated = lockResult.rows[0];
    }

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
const rejectRequirement = async (requirementId, user, reason) => {
  const result = await pool.query("SELECT * FROM requirements WHERE id = $1", [requirementId]);
  const requirement = result.rows[0];

  if (!requirement) throw new AppError("Requirement not found", 404);
  if (requirement.status !== "pending_approval") {
    throw new AppError(`Cannot reject a requirement in status '${requirement.status}'`, 400);
  }

  const isParticipant =
    (user.role === "retailer" && requirement.retailer_id === user.id) ||
    (user.role === "manufacturer" && requirement.manufacturer_id === user.id);

  if (!isParticipant) {
    throw new AppError("Not authorized to reject this requirement", 403);
  }

  const updateResult = await pool.query(
    `UPDATE requirements
     SET status = 'rejected', description = COALESCE($2, description)
     WHERE id = $1
     RETURNING *`,
    [requirementId, reason ? `${requirement.description || ""}\n[Rejected: ${reason}]` : null],
  );

  return updateResult.rows[0];
};
module.exports = {createRequirement, getRequirementsById,listRequirementsForUser,assignParticipants, approveRequirement, rejectRequirement};