<?php
include 'db.php';

$result = $conn->query("SELECT * FROM departments");
if ($result->num_rows > 0) {
    echo "<table><tr><th>ID</th><th>Name</th><th>Description</th><th>Manager ID</th><th>Budget</th><th>Status</th><th>Created</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td><td>{$row['name']}</td><td>{$row['description']}</td>
            <td>{$row['manager_id']}</td><td>{$row['budget']}</td><td>{$row['status']}</td>
            <td>{$row['created_at']}</td>
        </tr>";
    }
    echo "</table>";
} else {
    echo "No departments found.";
}
$conn->close();
?>
