<?php
include 'db.php';

$result = $conn->query("SELECT * FROM payroll");
if ($result->num_rows > 0) {
    echo "<table><tr><th>ID</th><th>Emp ID</th><th>Period</th><th>Salary</th><th>OT</th><th>Bonus</th><th>Deductions</th><th>Net</th><th>Status</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td><td>{$row['employee_id']}</td>
            <td>{$row['pay_period_start']} to {$row['pay_period_end']}</td>
            <td>{$row['basic_salary']}</td><td>{$row['overtime_hours']} * {$row['overtime_rate']}</td>
            <td>{$row['bonus']}</td><td>{$row['deductions']}</td>
            <td>{$row['net_salary']}</td><td>{$row['status']}</td>
        </tr>";
    }
    echo "</table>";
} else {
    echo "No payroll records.";
}
$conn->close();
?>
