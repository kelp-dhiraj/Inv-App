'use strict';

module.exports = (sequelize, DataTypes) => {
    const Prospect = sequelize.define('Prospect', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        owner_employee_id: DataTypes.INTEGER,
        prospect_name: DataTypes.STRING(255),
        primary_office_city: DataTypes.STRING(255),
        region: DataTypes.STRING(50),
        priority_code: DataTypes.STRING(100),
        assessment_stage_code: DataTypes.STRING(50),
        category_code: DataTypes.STRING(50),
        fund_raise_stage_code: DataTypes.STRING(50),
        //likelihood_section: DataTypes.STRING(50),
        ticket_size: DataTypes.INTEGER,
        india_allocation_code: DataTypes.STRING,
        india_allocation_comment: DataTypes.STRING(255),
        strategic_india_alignment_code: DataTypes.STRING(255),
        strategic_india_alignment_comment: DataTypes.STRING(255),
        tn_track_record_bias_code: DataTypes.STRING,
        tn_track_record_bias_comment: DataTypes.STRING(255),
        senior_advocate_code: DataTypes.STRING,
        senior_advocate_comment: DataTypes.STRING(255),
        positive_negative_surprise_code: DataTypes.STRING,
        positive_negative_surprise_comment: DataTypes.STRING(255),
        fund_raise_stage_comment: DataTypes.STRING,
        created_by: DataTypes.INTEGER,
        updated_by: DataTypes.INTEGER,
    }, {
        tableName: 'prospects', 
        timestamps: false,
    });

    Prospect.associate = (models) => {
        models.Prospect.belongsTo(models.Employee, {
            foreignKey: 'owner_employee_id',
            as: 'owner'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'priority_code',
            targetKey: 'lookup_code',
            as: 'priority'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'assessment_stage_code',
            targetKey: 'lookup_code',
            as: 'asses_stg'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'category_code',
            targetKey: 'lookup_code',
            as: 'cat'
        });

        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'fund_raise_stage_code',
            targetKey: 'lookup_code',
            as: 'fund_stg'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'india_allocation_code',
            targetKey: 'lookup_code',
            as: 'india_alloc'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'strategic_india_alignment_code',
            targetKey: 'lookup_code',
            as: 'india_align'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'tn_track_record_bias_code',
            targetKey: 'lookup_code',
            as: 'tn_bias'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'senior_advocate_code',
            targetKey: 'lookup_code',
            as: 'advocate'
        });
        models.Prospect.belongsTo(models.CommonListValue, {
            foreignKey: 'positive_negative_surprise_code',
            targetKey: 'lookup_code',
            as: 'surprise'
        });
        models.Prospect.hasMany(models.Interaction, {
            foreignKey: 'client_id'
            , as: 'interactions'
        })

    };


    return Prospect;
};
