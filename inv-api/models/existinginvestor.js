'use strict';

module.exports = (sequelize, DataTypes) => {
    const ExistingInvestor = sequelize.define('ExistingInvestor', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        owner_employee_id: DataTypes.INTEGER,
        investor_name: DataTypes.STRING(255),
        primary_office_city: DataTypes.STRING(255),
        region: DataTypes.STRING(50),
        fund_code: DataTypes.STRING(30),
        stage_code: DataTypes.STRING(50),
        category_code: DataTypes.STRING(50),
        fund_raise_stage_code: DataTypes.STRING(50),
        ticket_size: DataTypes.INTEGER,
        share_of_wallet_code: DataTypes.STRING(30),
        share_of_wallet_comment: DataTypes.STRING(255),
        investment_performance_code: DataTypes.STRING(30),
        investment_performance_comment: DataTypes.STRING(255),
        working_level_support_code: DataTypes.STRING(30),
        working_level_support_comment: DataTypes.STRING(255),
        senior_level_connect_code: DataTypes.STRING(30),
        senior_level_connect_comment: DataTypes.STRING(255),
        subjective_factor_code: DataTypes.STRING(30),
        subjective_factor_comment: DataTypes.STRING(255),
        created_by: DataTypes.INTEGER,
        updated_by: DataTypes.INTEGER
    }, {
        tableName: 'existing_investors',
        timestamps: false,
    });

    ExistingInvestor.associate = (models) => {
        models.ExistingInvestor.belongsTo(models.Employee, {
            foreignKey: 'owner_employee_id',
            as: 'owner'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'fund_code',
            targetKey: 'lookup_code',
            as: 'fund'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'stage_code',
            targetKey: 'lookup_code',
            as: 'stage'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'category_code',
            targetKey: 'lookup_code',
            as: 'category'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'fund_raise_stage_code',
            targetKey: 'lookup_code',
            as: 'fund_raise_stg'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'share_of_wallet_code',
            targetKey: 'lookup_code',
            as: 'share_of_wallet'
        });       
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'investment_performance_code',
            targetKey: 'lookup_code',
            as: 'investment_per'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'working_level_support_code',
            targetKey: 'lookup_code',
            as: 'work_lvl_support'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'senior_level_connect_code',
            targetKey: 'lookup_code',
            as: 'senior_lvl_conn'
        });
        models.ExistingInvestor.belongsTo(models.CommonListValue, {
            foreignKey: 'subjective_factor_code',
            targetKey: 'lookup_code',
            as: 'sub_fact'
        });
        models.ExistingInvestor.hasMany(models.Interaction, {
            foreignKey: 'client_id'
            , as: 'interactions'
        })

    };


    return ExistingInvestor;
};