<?php
include 'db.php';

$result = $conn->query("SELECT * FROM attendance");
if ($result->num_rows > 0) {
    echo "<table><tr><th>ID</th><th>Emp ID</th><th>Date</th><th>In</th><th>Out</th><th>Break</th><th>Hours</th><th>Status</th><th>Notes</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td><td>{$row['employee_id']}</td><td>{$row['date']}</td>
            <td>{$row['check_in']}</td><td>{$row['check_out']}</td><td>{$row['break_duration']}</td>
            <td>{$row['total_hours']}</td><td>{$row['status']}</td><td>{$row['notes']}</td>
        </tr>";
    }
    echo "</table>";
} else {
    echo "No attendance records.";
}
$conn->close();
?>
