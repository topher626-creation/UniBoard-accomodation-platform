const { User, Property, Review } = require('../src/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function generateReport() {
  console.log('Generating weekly performance report...');
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // 1. User Engagement Metrics
    const totalUsers = await User.count();
    const newUsers = await User.count({
      where: { created_at: { [Op.gte]: oneWeekAgo } }
    });
    const students = await User.count({ where: { role: 'student' } });
    const landlords = await User.count({ where: { role: 'landlord' } });

    // 2. Property Performance Metrics
    const totalProperties = await Property.count();
    const approvedProperties = await Property.count({ where: { approved: true } });
    const newProperties = await Property.count({
      where: { created_at: { [Op.gte]: oneWeekAgo } }
    });
    
    const bedspaceStats = await Property.findAll({
      attributes: [
        [Property.sequelize.fn('SUM', Property.sequelize.col('total_bedspaces')), 'total'],
        [Property.sequelize.fn('SUM', Property.sequelize.col('occupied_bedspaces')), 'occupied']
      ],
      where: { approved: true },
      raw: true
    });

    // 3. Platform Health
    const newReviews = await Review.count({
      where: { created_at: { [Op.gte]: oneWeekAgo } }
    });

    const report = {
      timestamp: new Date().toISOString(),
      period: {
        start: oneWeekAgo.toISOString(),
        end: new Date().toISOString()
      },
      users: {
        total: totalUsers,
        new_this_week: newUsers,
        students,
        landlords
      },
      properties: {
        total: totalProperties,
        approved: approvedProperties,
        new_this_week: newProperties,
        bedspaces: {
          total: parseInt(bedspaceStats[0].total || 0),
          occupied: parseInt(bedspaceStats[0].occupied || 0),
          available: parseInt(bedspaceStats[0].total || 0) - parseInt(bedspaceStats[0].occupied || 0)
        }
      },
      engagement: {
        new_reviews: newReviews
      }
    };

    // Save report to file
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }
    
    const fileName = `report_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    
    console.log(`Report generated successfully: ${filePath}`);
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateReport();
}

module.exports = generateReport;
