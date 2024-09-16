'use strict';

module.exports = (sequelize, DataTypes) => {
    const Interaction = sequelize.define('Interaction', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        client_id: DataTypes.INTEGER,
        client_type_code: DataTypes.STRING(255),
        interaction_type_code: DataTypes.STRING,
        interaction_date: DataTypes.DATE,
        comments: DataTypes.STRING(50),
        team_code: DataTypes.STRING(100),
    }, {
        tableName: 'interactions', 
        timestamps: false,
    });

    Interaction.associate = (models) => {
        models.Interaction.belongsTo(models.Prospect, {
            foreignKey: 'client_id',
            as: 'prospect'
        });
        models.Interaction.belongsTo(models.ExistingInvestor, {
            foreignKey: 'client_id',
            as: 'existing'
        });
        models.Interaction.belongsTo(models.CommonListValue, {
            foreignKey: 'interaction_type_code',
            targetKey: 'lookup_code',
            as: 'int_type'
        });
        models.Interaction.belongsTo(models.CommonListValue, {
            foreignKey: 'team_code',
            targetKey: 'lookup_code',
            as: 'team'
        });

        models.Interaction.belongsTo(models.CommonListValue, {
            foreignKey: 'client_type_code',
            targetKey: 'lookup_code',
            as: 'source_type'
        });
    };
    return Interaction;
};
